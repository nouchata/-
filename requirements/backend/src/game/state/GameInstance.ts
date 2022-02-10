import { GameOptions } from "../types/GameOptions";
import { PlayerState } from "../types/PlayerState";
import { InstanceSettings } from "../types/InstanceSettings";
import { Server } from 'socket.io';
import { ResponseState, RUNSTATE } from "../types/ResponseState";
import { GameAction, GA_KEY } from "../types/GameAction";
import { cloneDeep } from "lodash";
import { BallState } from "../types/BallState";

const samplePlayer : PlayerState = {
	id: 0,
	connected: false,
	pos: { x: undefined, y: 50 },
	flags: {
		falsePosAnimation: false,
		capacityCharging: false,
		stuned: false,
		rainbowing: false
	},
	capacityLoaderPercentage: 0,
	stockedCapacity: undefined
};

const sampleBall : BallState = {
	pos: { x: 50, y: 50 },
	directionVector: { x: 1, y: 0.5 },
	headingRight: true,
	headingTop: true,
	speedPPS: 50,
	flags: {
		rainbow: false,
		smash: false,
		freezed: false,
		showed: false
	}
}

class GameInstance {
	// class related
	private runState : RUNSTATE = RUNSTATE.RUNNING;

	private mSecElapsed : number = 0;
	/* used to define a condition based on time elapsed */
	private runStateSecCondition : number = 0;
	private instanceId : number;
	private gameInstances : { [instanceId: number]: GameInstance | undefined };
	private associatedPlayers : { [userId: number]: number | undefined };

	// ws related
	private wsServer : Server;
	private wsRoom : string;

	// game related
	private gameOptions : GameOptions = {
		gameType: "standard",
		capChargingPPS: 100 / 3,
		yDistPPS: 50,
		racketSize: 6,
		ballSpeedPPS: 50
	};

	// ball related
	private ballState : BallState = cloneDeep(sampleBall);
	private lastMsPlayerBallCollision : number = 0;

	// player related
	private playerOne : PlayerState = cloneDeep(samplePlayer);
	// private playerOneReceivedGameAction: { [actionId: number]: GameAction | undefined } = {};
	private playerOneLastActionProcessed: number = -1;
	private playerTwo : PlayerState = cloneDeep(samplePlayer);
	// private playerTwoReceivedGameAction: { [actionId: number]: GameAction | undefined } = {};
	private playerTwoLastActionProcessed: number = -1;
	private responseState : ResponseState;

	constructor(
		instanceSettings : InstanceSettings,
		givenGameOptions? : Partial<GameOptions>
	) {
		if (givenGameOptions)
			Object.assign(this.gameOptions, givenGameOptions);

		// class vars
		this.instanceId = instanceSettings.instanceId;
		this.gameInstances = instanceSettings.gameInstances;
		this.associatedPlayers = instanceSettings.associatedPlayers;
		this.wsServer = instanceSettings.wsServer;
		this.wsRoom = "game#" + this.instanceId;

		// player object creation
		this.playerOne.id = instanceSettings.playersId.one;
		this.playerTwo.id = instanceSettings.playersId.two;

		// ball stuff
		this.ballState.speedPPS = this.gameOptions.ballSpeedPPS;

		this.responseState = {
			instanceId: this.instanceId,
			gameOptions: this.gameOptions,
			mSecElipsed: this.mSecElapsed,
			runState: this.runState,
			ballState: cloneDeep(this.ballState),
			playerOne: cloneDeep(this.playerOne),
			playerTwo: cloneDeep(this.playerTwo),
			playerOneLastActionProcessed: this.playerOneLastActionProcessed,
			playerTwoLastActionProcessed: this.playerTwoLastActionProcessed
		};

		this.run();
	}

	private async run() {
		while (this.runState !== RUNSTATE.ENDED) {
			this.runStateHandler();
			this.movementChecker();
			this.chargingChecker();
			this.ballHandler();
			this.responseRefresh();
			this.wsServer.to(this.wsRoom).emit('stateUpdate', this.responseState);
			await new Promise((resolve) => setTimeout(() => resolve(1), 100));
			this.mSecElapsed += 100;
		}
		this.associatedPlayers[this.playerOne.id] = 0;
		this.associatedPlayers[this.playerTwo.id] = 0;
		this.gameInstances[this.instanceId] = undefined;
	}

	private runStateHandler() {
		if (this.runState === RUNSTATE.WAITING)
		{ // if both players aren't connected after 2 minutes the game is kill
			if (!this.runStateSecCondition)
				this.runStateSecCondition = this.mSecElapsed + (1000 * 120);
			if (this.playerOne.connected && this.playerTwo.connected) {
				this.runStateSecCondition = 0;
				this.runState = RUNSTATE.ABOUT_TO_RUN;
			}
			else if (this.runStateSecCondition === this.mSecElapsed) {
				this.runStateSecCondition = 0;
				this.runState = RUNSTATE.ENDED;
			}
		}
		else if (this.runState === RUNSTATE.ABOUT_TO_RUN)
		{ // wait 5 seconds and launch the game
			if (!this.runStateSecCondition)
				this.runStateSecCondition = this.mSecElapsed + (1000 * 5);
			if (this.runStateSecCondition === this.mSecElapsed) {
				this.runStateSecCondition = 0;
				this.runState = RUNSTATE.RUNNING;
			}
		}
		else if (this.runState === RUNSTATE.RUNNING)
		{
			// if (!this.playerOne.connected || !this.playerTwo.connected)
			// 	this.runState = RUNSTATE.PLAYER_DISCONNECTED;
		}
		else if (this.runState === RUNSTATE.PLAYER_DISCONNECTED)
		{ // wait 2 minutes for player to connect again or kill the game
			if (!this.runStateSecCondition)
				this.runStateSecCondition = this.mSecElapsed + (1000 * 120);
			if (this.playerOne.connected && this.playerTwo.connected) {
				this.runStateSecCondition = 0;
				this.runState = RUNSTATE.RUNNING;
			} else if (this.runStateSecCondition === this.mSecElapsed) {
				this.runStateSecCondition = 0;
				this.runState = RUNSTATE.ENDED;
			}
		}
	}

	private responseRefresh() {
		this.responseState.mSecElipsed = this.mSecElapsed;
		this.responseState.runState = this.runState;
		this.responseState.playerOne = cloneDeep(this.playerOne);
		this.responseState.playerTwo = cloneDeep(this.playerTwo);
		this.responseState.ballState = cloneDeep(this.ballState);
		this.responseState.playerOneLastActionProcessed = this.playerOneLastActionProcessed;
		this.responseState.playerTwoLastActionProcessed = this.playerTwoLastActionProcessed;
	}

	// incoming position changes
	private movementHandler(gameAction: GameAction, isPlayerOne: boolean) {
		if (isPlayerOne) {
			this.playerOne.pos.y = gameAction.data.y as number;
			this.playerOneLastActionProcessed = gameAction.id;
		}
		else {
			this.playerTwo.pos.y = gameAction.data.y as number;
			this.playerTwoLastActionProcessed = gameAction.id;
		}
	}

	private chargingHandler(gameAction: GameAction, isPlayerOne: boolean) {
		let playerState: PlayerState = isPlayerOne ? this.playerOne : this.playerTwo;
		if (!playerState.flags.stuned && this.gameOptions.gameType === "extended") {
			if (gameAction.data.chargingOn) {
				playerState.flags.capacityCharging = true;
				playerState.flags.rainbowing = true;
			}
			else {
				playerState.flags.capacityCharging = false;
				playerState.flags.rainbowing = false;
			}
		}
	}

	private ballHandler() {
		this.ballState.pos.x += this.ballState.directionVector.x * (this.ballState.speedPPS / 10);
		this.ballState.pos.y += this.ballState.directionVector.y * (this.ballState.speedPPS / 10);
		// could be better computed
		if (this.ballState.pos.y < 0) {
			this.ballState.pos.y *= -1;
			this.ballState.directionVector.y *= -1;
		}
		else if (this.ballState.pos.y > 100) {
			this.ballState.pos.y = 100 - (this.ballState.pos.y - 100);
			this.ballState.directionVector.y *= -1;
		}
		if (this.ballState.pos.x < 0) {
			this.ballState.pos.x *= -1;
			this.ballState.directionVector.x *= -1;
		}
		else if (this.ballState.pos.x > 100) {
			this.ballState.pos.x = 100 - (this.ballState.pos.x - 100);
			this.ballState.directionVector.x *= -1;
		}
	}

	private ballCollisionPlayerChecker(gameAction: GameAction, isPlayerOne: boolean) {
		let differencePlayerY : number = 0;
		let differenceBall : number[] = [];
		console.log("collision init");
		if (isPlayerOne && gameAction.data.ballPos.x <= 25) {
			differencePlayerY = this.playerOne.pos.y - gameAction.data.y;
			differenceBall[0] = this.ballState.pos.x - gameAction.data.ballPos.x;
			differenceBall[0] = this.ballState.pos.y - gameAction.data.ballPos.y;
			console.log("collision check start");
			// if ((differencePlayerY < -10 || differencePlayerY > 10) ||
			// (differenceBall[0] < -10 || differenceBall[0] > 10) ||
			// (differenceBall[1] < -10 || differenceBall[1] > 10))
			// 	return ;
			this.ballState.directionVector.x = 1;
			this.ballState.directionVector.y = (Math.floor(Math.random() * (8 - 2 + 1)) + 2) / 10;
			this.lastMsPlayerBallCollision = this.mSecElapsed;
			console.log("collision check done");
		} else if (!isPlayerOne && gameAction.data.ballPos.x >= 75) {
			differencePlayerY = this.playerOne.pos.y - gameAction.data.y;
			differenceBall[0] = this.ballState.pos.x - gameAction.data.ballPos.x;
			differenceBall[0] = this.ballState.pos.y - gameAction.data.ballPos.y;
			if ((differencePlayerY < -10 || differencePlayerY > 10) ||
			(differenceBall[0] < -10 || differenceBall[0] > 10) ||
			(differenceBall[1] < -10 || differenceBall[1] > 10))
				return ;
			this.ballState.directionVector.x = -1;
			this.ballState.directionVector.y = (Math.floor(Math.random() * (8 - 2 + 1)) + 2) / 10;
			this.lastMsPlayerBallCollision = this.mSecElapsed;
		}
	}

	// speed anti-cheat
	private movementChecker() {
		let hundredMsMovementAllowed: number = this.gameOptions.yDistPPS / 100 * 15; // 5% ease range
		let percentageHalfRacketSize: number = 100 / this.gameOptions.racketSize / 2;
			
		if (this.playerOne.pos.y > this.responseState.playerOne.pos.y) { // goes bottom
			if ((this.playerOne.pos.y - this.responseState.playerOne.pos.y) > hundredMsMovementAllowed)
				this.playerOne.pos.y = this.responseState.playerOne.pos.y + hundredMsMovementAllowed;
			if (this.playerOne.pos.y > 100 - percentageHalfRacketSize)
				this.playerOne.pos.y = 100 - percentageHalfRacketSize;
		} else if (this.playerOne.pos.y < this.responseState.playerOne.pos.y) {
			if ((this.responseState.playerOne.pos.y - this.playerOne.pos.y) > hundredMsMovementAllowed)
				this.playerOne.pos.y = this.responseState.playerOne.pos.y - hundredMsMovementAllowed;
			if (this.playerOne.pos.y < percentageHalfRacketSize)
				this.playerOne.pos.y = percentageHalfRacketSize;
		}
		if (this.playerTwo.pos.y > this.responseState.playerTwo.pos.y) { // goes bottom
			if ((this.playerTwo.pos.y - this.responseState.playerTwo.pos.y) > hundredMsMovementAllowed)
				this.playerTwo.pos.y = this.responseState.playerTwo.pos.y + hundredMsMovementAllowed;
			if (this.playerTwo.pos.y > 100 - percentageHalfRacketSize)
				this.playerTwo.pos.y = 100 - percentageHalfRacketSize;
		} else if (this.playerTwo.pos.y < this.responseState.playerTwo.pos.y) {
			if ((this.responseState.playerTwo.pos.y - this.playerTwo.pos.y) > hundredMsMovementAllowed)
				this.playerTwo.pos.y = this.responseState.playerTwo.pos.y - hundredMsMovementAllowed;
			if (this.playerTwo.pos.y < percentageHalfRacketSize)
				this.playerTwo.pos.y = percentageHalfRacketSize;
		}
	}

	// charging state update
	private chargingChecker() {
		if (this.gameOptions.gameType === "extended") {
			if (this.playerOne.flags.capacityCharging) {
				if (this.playerOne.capacityLoaderPercentage < 100) {
					this.playerOne.capacityLoaderPercentage += this.gameOptions.capChargingPPS / 10;
					if (this.playerOne.capacityLoaderPercentage > 100)
						this.playerOne.capacityLoaderPercentage = 100;
				}
			} else {
				if (this.playerOne.capacityLoaderPercentage)
					this.playerOne.capacityLoaderPercentage = 0;
			}
			if (this.playerTwo.flags.capacityCharging) {
				if (this.playerTwo.capacityLoaderPercentage < 100) {
					this.playerTwo.capacityLoaderPercentage += this.gameOptions.capChargingPPS / 10;
					if (this.playerTwo.capacityLoaderPercentage > 100)
						this.playerTwo.capacityLoaderPercentage = 100;
				}
			} else {
				if (this.playerTwo.capacityLoaderPercentage)
					this.playerTwo.capacityLoaderPercentage = 0;
			}
		}
	}

	// PUBLIC FUNCTIONS

	updatePlayerNetState(playerId: number, state: boolean) {
		if (playerId === this.playerOne.id)
			this.playerOne.connected = state;
		else if (playerId === this.playerTwo.id)
			this.playerTwo.connected = state;
	}

	injectGameAction(gameAction: GameAction, playerId: number) {
		if (this.runState === RUNSTATE.RUNNING &&
			(playerId === this.playerOne.id || playerId === this.playerTwo.id))
		{
			if (gameAction.keyPressed === GA_KEY.UP || gameAction.keyPressed === GA_KEY.DOWN)
				this.movementHandler(gameAction, playerId === this.playerOne.id);
			if (gameAction.keyPressed === GA_KEY.SPACE)
				this.chargingHandler(gameAction, playerId === this.playerOne.id);
			if (gameAction.keyPressed === GA_KEY.NONE && gameAction.data.ballPos)
				this.ballCollisionPlayerChecker(gameAction, playerId === this.playerOne.id);
		}
	}
};

export { GameInstance, RUNSTATE };