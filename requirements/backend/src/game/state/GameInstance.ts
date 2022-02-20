import { GameOptions } from "../types/GameOptions";
import { PlayerState, PLAYER_CAPACITY } from "../types/PlayerState";
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
	directionVector: { x: 1, y: 0 },
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
	private lastDeltaTime : number = 0;

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
	private smashDelay : number = 0;

	// player related
	private playerOne : PlayerState = cloneDeep(samplePlayer);
	private playerOneLastActionProcessed: number = -1;
	private playerTwo : PlayerState = cloneDeep(samplePlayer);
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
		
		/* DEV PURPOSE */
		this.playerOne.stockedCapacity = PLAYER_CAPACITY.SMASH;
		/* DEV PURPOSE */

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

		this.lastDeltaTime = Date.now();
		this.run();
	}

	private async run() {
		let actualDeltaTime : number = 0;
		let delta : number = 0;
		while (this.runState !== RUNSTATE.ENDED) {
			// delta handling
			actualDeltaTime = Date.now();
			delta = actualDeltaTime - this.lastDeltaTime;
			this.lastDeltaTime = actualDeltaTime;
			this.runStateHandler();
			this.movementChecker();
			this.chargingChecker(delta);
			if (!this.ballState.flags.freezed)
				this.ballHandler(delta);

			this.smashHandler();

			this.responseRefresh();
			this.wsServer.to(this.wsRoom).emit('stateUpdate', this.responseState);
			await new Promise((resolve) => setTimeout(() => resolve(1), 100));
			this.mSecElapsed += delta;
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
		this.responseState.ballState = this.ballState;
		this.responseState.playerOneLastActionProcessed = this.playerOneLastActionProcessed;
		this.responseState.playerTwoLastActionProcessed = this.playerTwoLastActionProcessed;
	}

	// incoming position changes
	private movementHandler(gameAction: GameAction, isPlayerOne: boolean) {
		let playerState: PlayerState = isPlayerOne ? this.playerOne : this.playerTwo;
		if (!playerState.flags.stuned) {
			playerState.pos.y = gameAction.data.y as number;
			if (isPlayerOne)
				this.playerOneLastActionProcessed = gameAction.id;
			else
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

	private ballHandler(delta: number) {
		let ballSpeed : number = this.ballState.speedPPS * (this.ballState.flags.smash ? 2 : 1);
		this.ballState.pos.x += this.ballState.directionVector.x * (delta * (ballSpeed / 10) / 100);
		this.ballState.pos.y += this.ballState.directionVector.y * (delta * (ballSpeed / 10) / 100);
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
		let differenceBallEaseRange : number = this.ballState.flags.smash ? 10 : 10;
		let currentPlayer : PlayerState = isPlayerOne ? this.playerOne : this.playerTwo;
		if (isPlayerOne ? gameAction.data.ballPos.x <= 25 : gameAction.data.ballPos.x >= 75) {
			differencePlayerY = currentPlayer.pos.y - gameAction.data.y;
			differenceBall[0] = this.ballState.pos.x - gameAction.data.ballPos.x;
			differenceBall[1] = this.ballState.pos.y - gameAction.data.ballPos.y;
			// console.log(`pre if: ${differenceBall} ${gameAction.data.ballPos.x} ${this.ballState.pos.x}`);
			// console.log(`p:${differencePlayerY} dy:${gameAction.data.y}`);
			if ((differencePlayerY < -(differenceBallEaseRange) || differencePlayerY > differenceBallEaseRange) ||
			(differenceBall[0] < -(differenceBallEaseRange) || differenceBall[0] > differenceBallEaseRange) ||
			(differenceBall[1] < -(differenceBallEaseRange) || differenceBall[1] > differenceBallEaseRange))
				return ;
			this.ballState.directionVector.x = isPlayerOne ? 1 : -1;
			// angle computation
			let topOfRacket: number = gameAction.data.y - (100 / this.gameOptions.racketSize / 2);
			let ballPercentageRacket: number = Math.floor((gameAction.data.ballPos.y - topOfRacket) / ((100 / this.gameOptions.racketSize) / 100));
			if (ballPercentageRacket < 10)
				ballPercentageRacket = 10;
			if (ballPercentageRacket > 90)
				ballPercentageRacket = 90;
			let newAngle: number = -10;
			for (let step = 10; !(ballPercentageRacket >= step && ballPercentageRacket <= step + 9) && newAngle < 6; step += 10)
				newAngle += 2;
			newAngle += 2;
			this.ballState.directionVector.y = newAngle / 10;
			this.lastMsPlayerBallCollision = this.mSecElapsed;
			// console.log(`${currentPlayer.capacityLoaderPercentage} ${currentPlayer.stockedCapacity} ${this.ballState.flags.smash}`);
			if (this.ballState.flags.smash) {
				this.ballState.flags.smash = false;
				this.ballState.flags.rainbow = false;
				// console.log('smash end');
			}
			// smash signal
			if (currentPlayer.capacityLoaderPercentage >= 98 && currentPlayer.stockedCapacity === PLAYER_CAPACITY.SMASH) {
				this.ballState.flags.freezed = true;
				this.ballState.flags.rainbow = true;
				this.ballState.flags.smash = true;
				currentPlayer.flags.stuned = true;
				this.ballState.pos.x = gameAction.data.ballPos.x;
				this.ballState.pos.y = gameAction.data.ballPos.y;
				// console.log(`smash loading ${this.ballState.pos.x}`);
				this.smashDelay = this.mSecElapsed;
			}
		}
	}

	// speed anti-cheat
	private movementChecker() {
		let hundredMsMovementAllowed: number = this.gameOptions.yDistPPS / 100 * 15; // 5% ease range
		let percentageHalfRacketSize: number = 100 / this.gameOptions.racketSize / 2;
		let players : Array<PlayerState> = [this.playerOne, this.playerTwo];
		let i: number = 0;
		for (let player of players) {
			let responsePlayer: PlayerState = !i ? this.responseState.playerOne : this.responseState.playerTwo;
			if (player.pos.y > responsePlayer.pos.y) { // goes bottom
				if ((player.pos.y - responsePlayer.pos.y) > hundredMsMovementAllowed)
					player.pos.y = responsePlayer.pos.y + hundredMsMovementAllowed;
				if (player.pos.y > 100 - percentageHalfRacketSize)
					player.pos.y = 100 - percentageHalfRacketSize;
			} else if (player.pos.y < responsePlayer.pos.y) {
				if ((responsePlayer.pos.y - player.pos.y) > hundredMsMovementAllowed)
					player.pos.y = responsePlayer.pos.y - hundredMsMovementAllowed;
				if (player.pos.y < percentageHalfRacketSize)
					player.pos.y = percentageHalfRacketSize;
			}
			i++;
		}
	}

	// charging state update
	private chargingChecker(delta: number) {
		if (this.gameOptions.gameType === "extended") {
			let players : Array<PlayerState> = [this.playerOne, this.playerTwo];
			for (let player of players) {
				if (player.flags.capacityCharging) {
					if (player.capacityLoaderPercentage < 100) {
						player.capacityLoaderPercentage += (delta * (this.gameOptions.capChargingPPS / 10) / 100);
						if (player.capacityLoaderPercentage > 100)
							player.capacityLoaderPercentage = 100;
					}
				} else if (this.ballState.flags.smash && this.ballState.flags.freezed && player.capacityLoaderPercentage >= 98) {
					player.capacityLoaderPercentage = 100;
				} else {
					if (player.capacityLoaderPercentage)
						player.capacityLoaderPercentage = 0;
				}
			}
		}
	}

	private smashHandler() {
		if (this.ballState.flags.smash && this.ballState.flags.freezed) {
			let msDifference : number = this.mSecElapsed - this.smashDelay - 500;
			// console.log(`smash handler ${this.mSecElapsed} ${this.smashDelay} ${this.mSecElapsed - this.smashDelay}`);
			if (msDifference < 50 && msDifference > -50) {
				let playerState: PlayerState = this.ballState.pos.x < 50 ? this.playerOne : this.playerTwo;
				// console.log(`smash loading ${this.ballState.pos.x}`);
				this.ballState.flags.freezed = false;
				playerState.flags.capacityCharging = false;
				playerState.flags.rainbowing = false;
				playerState.capacityLoaderPercentage = 0;
				playerState.stockedCapacity = PLAYER_CAPACITY.NONE;
				playerState.flags.stuned = false;
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