import { GameOptions } from "../types/GameOptions";
import { playerCapacityDelay, PlayerState, PLAYER_CAPACITY } from "../types/PlayerState";
import { InstanceSettings } from "../types/InstanceSettings";
import { Server } from 'socket.io';
import { ResponseState, RUNSTATE } from "../types/ResponseState";
import { GameAction, GA_KEY } from "../types/GameAction";
import { cloneDeep } from "lodash";
import { BallState } from "../types/BallState";
import { GameService } from "../game.service";
import { Inject } from "@nestjs/common";

const samplePlayer : PlayerState = {
	id: 0,
	connected: false,
	pos: { x: undefined, y: 50 },
	flags: {
		falsePosAnimation: false,
		capacityCharging: false,
		stuned: true,
		rainbowing: false
	},
	score: 0,
	capacityLoaderPercentage: 0,
	capacityUnlockerPercentage: 0,
	stockedCapacity: PLAYER_CAPACITY.NONE,
	capacityTimeTrigger: 0
};

const sampleBall : BallState = {
	pos: { x: 50, y: 50 },
	directionVector: { x: 1, y: 0 },
	speedPPS: 50,
	flags: {
		rainbow: false,
		smash: false,
		freezed: true,
		showed: false
	}
}

class GameInstance {
	// class related
	private runState : RUNSTATE = RUNSTATE.WAITING;
	private lastDeltaTime : number = 0;

	private mSecElapsed : number = 0;
	/* used to define a condition based on time elapsed */
	private runStateStartWaitingTime : number = 0;
	private runStateStartBeforeGameTime : number = 0;
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
	private globalFreezeStartTimer : number = 0;
	private forceGlobalFreeze : boolean = true;

	// ball related
	private ballState : BallState = cloneDeep(sampleBall);

	// player related
	private playerOne : PlayerState = cloneDeep(samplePlayer);
	private playerOneLastActionProcessed : number = -1;
	private playerTwo : PlayerState = cloneDeep(samplePlayer);
	private playerTwoLastActionProcessed : number = -1;
	private playersDisconnectTimer : Array<number> = [0, 0];

	private responseState : ResponseState;

	constructor(
		@Inject(GameService) private gameService: GameService,
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
			this.powersHandler();
			if (!this.ballState.flags.freezed)
				this.ballHandler(delta);
			this.globalFreezeHandler();

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
		if (this.runState === RUNSTATE.WAITING || this.runState === RUNSTATE.PLAYER_DISCONNECTED)
		{
			if (!this.runStateStartWaitingTime && (!this.playerOne.connected || !this.playerTwo.connected)) {
				this.runStateStartBeforeGameTime = 0;
				this.runStateStartWaitingTime = this.mSecElapsed;
			}
			if (!this.runStateStartBeforeGameTime && this.playerOne.connected && this.playerTwo.connected) {
				this.runStateStartWaitingTime = 0;
				this.runStateStartBeforeGameTime = this.mSecElapsed;
			}
			
			if (this.runStateStartWaitingTime && 
			this.mSecElapsed - this.runStateStartWaitingTime - ((this.runState === RUNSTATE.WAITING ? 120 : 60) * 1000) > -50) {
				this.runStateStartBeforeGameTime = 0;
				this.runStateStartWaitingTime = 0;
				this.runState = RUNSTATE.ENDED;
			}
			if (this.runStateStartBeforeGameTime && 
			this.mSecElapsed - this.runStateStartBeforeGameTime - (5 * 1000) > -50) {
				this.runStateStartBeforeGameTime = 0;
				this.runStateStartWaitingTime = 0;
				this.runState = RUNSTATE.RUNNING;
				this.globalFreezeSetter();
				this.forceGlobalFreeze = false;
			}
		}
		else if (this.runState === RUNSTATE.RUNNING)
		{
			if (!this.playerOne.connected || !this.playerTwo.connected)
				this.runState = RUNSTATE.PLAYER_DISCONNECTED;
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

	private scoreRegister() {
		let players : Array<PlayerState> = [this.playerOne, this.playerTwo];
		let winner: number = this.ballState.pos.x < 50 ? 1 : 0; // round winner index

		players[winner].score++;
		this.ballState.flags.rainbow = false;
		this.ballState.flags.smash = false;
		this.ballState.speedPPS = this.gameOptions.ballSpeedPPS;

		if (players[winner].score >= 6) { // a player won
			this.forceGlobalFreeze = true;
			this.runState = RUNSTATE.AFTER_GAME;

			this.gameService.saveMatchResult(players[winner], players[Math.abs(winner - 1)]);
		}

		this.globalFreezeSetter({ resetBallPos: true, resetPlayerPos: true });
	}

	private globalFreezeSetter(options? :{ resetPlayerPos?: boolean, resetBallPos?: boolean }) {
		let players : Array<PlayerState> = [this.playerOne, this.playerTwo];
		for (let player of players) {
			if (options?.resetPlayerPos)
				player.pos.y = 50;
			player.flags.rainbowing = false;
			player.flags.capacityCharging = false;
			player.flags.stuned = true;
			player.capacityLoaderPercentage = 0;
			player.capacityTimeTrigger = -1;
		}
		this.ballState.flags.freezed = true;
		// this.ballState.flags.rainbow = false;
		// this.ballState.flags.smash = false;
		if (options?.resetBallPos) {
			this.ballState.directionVector.x = this.ballState.pos.x < 50 ? -1 : 1;
			this.ballState.directionVector.y = 0;
			this.ballState.pos.x = 50;
			this.ballState.pos.y = 50;
		}
		this.globalFreezeStartTimer = this.mSecElapsed;
	}

	private globalFreezeHandler() {
		if (this.globalFreezeStartTimer) {
			const msDifference : number = this.mSecElapsed - this.globalFreezeStartTimer - 3000;
			if (msDifference > -50 && !this.forceGlobalFreeze) {
				this.playerOne.flags.stuned = false;
				this.playerTwo.flags.stuned = false;
				this.playerOne.capacityTimeTrigger = 0;
				this.playerTwo.capacityTimeTrigger = 0;
				this.ballState.flags.freezed = false;
				this.globalFreezeStartTimer = 0;
			}
		}
	}

	private chargingHandler(gameAction: GameAction, isPlayerOne: boolean) {
		let playerState: PlayerState = isPlayerOne ? this.playerOne : this.playerTwo;
		if (!playerState.flags.stuned && this.gameOptions.gameType === "extended" && !playerState.capacityTimeTrigger) {
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
		if (this.ballState.pos.x < -30 || this.ballState.pos.x > 130) {
			this.scoreRegister();
		}
	}

	private ballCollisionPlayerChecker(gameAction: GameAction, isPlayerOne: boolean) {
		let differencePlayerY : number = 0;
		let differenceBall : number[] = [];
		let differenceBallEaseRange : number = this.ballState.flags.smash ? 10 : 10;
		let currentPlayer : PlayerState = isPlayerOne ? this.playerOne : this.playerTwo;
		if (isPlayerOne ? gameAction.data.ballPos?.x as number <= 25 : gameAction.data.ballPos?.x as number >= 75) {
			differencePlayerY = currentPlayer.pos.y - (gameAction.data.y as number);
			differenceBall[0] = this.ballState.pos.x - (gameAction.data.ballPos?.x as number);
			differenceBall[1] = this.ballState.pos.y - (gameAction.data.ballPos?.y as number);
			// console.log(`pre if: ${differenceBall} ${gameAction.data.ballPos.x} ${this.ballState.pos.x}`);
			// console.log(`p:${differencePlayerY} dy:${gameAction.data.y}`);
			if ((differencePlayerY < -(differenceBallEaseRange) || differencePlayerY > differenceBallEaseRange) ||
			(differenceBall[0] < -(differenceBallEaseRange) || differenceBall[0] > differenceBallEaseRange) ||
			(differenceBall[1] < -(differenceBallEaseRange) || differenceBall[1] > differenceBallEaseRange))
				return ;
			this.ballState.directionVector.x = isPlayerOne ? 1 : -1;
			// angle computation
			let topOfRacket: number = (gameAction.data.y as number) - (100 / this.gameOptions.racketSize / 2);
			let ballPercentageRacket: number = Math.floor(((gameAction.data.ballPos?.y as number) - topOfRacket) / ((100 / this.gameOptions.racketSize) / 100));
			if (ballPercentageRacket < 10)
				ballPercentageRacket = 10;
			if (ballPercentageRacket > 90)
				ballPercentageRacket = 90;
			let newAngle: number = -10;
			for (let step = 10; !(ballPercentageRacket >= step && ballPercentageRacket <= step + 9) && newAngle < 6; step += 10)
				newAngle += 2;
			newAngle += 2;
			this.ballState.directionVector.y = newAngle / 10;
			this.ballState.speedPPS += 0.5; //
			// this.lastMsPlayerBallCollision = this.mSecElapsed;
			this.capacityUnlocker(currentPlayer);
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
				this.ballState.pos.x = gameAction.data.ballPos?.x || 0;
				this.ballState.pos.y = gameAction.data.ballPos?.y || 0;
				// console.log(`smash loading ${this.ballState.pos.x}`);
				currentPlayer.capacityTimeTrigger = this.mSecElapsed;
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
			if (!player.flags.stuned) {
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

	// effects handlers

	private powersHandler() {
		let players : Array<PlayerState> = [this.playerOne, this.playerTwo];
		for (let player of players) {
			if (player.capacityTimeTrigger > 0)
			{
				const msDifference : number = this.mSecElapsed - 
					player.capacityTimeTrigger - playerCapacityDelay[player.stockedCapacity];
				if (msDifference > -50) {
					if (player.stockedCapacity === PLAYER_CAPACITY.STUNNING) {
						if (player === this.playerOne)
							this.playerTwo.flags.stuned = false;
						else
							this.playerOne.flags.stuned = false;
					}
					else if (player.stockedCapacity === PLAYER_CAPACITY.SMASH) {
						player.flags.stuned = false;
						this.ballState.flags.freezed = false;
					}
					player.stockedCapacity = PLAYER_CAPACITY.NONE;
					player.capacityTimeTrigger = 0;
					player.capacityLoaderPercentage = 0;
					player.capacityUnlockerPercentage = 0;
					player.flags.capacityCharging = false;
					player.flags.rainbowing = false;
				}
			}
			else if (!player.capacityTimeTrigger && player.capacityLoaderPercentage >= 98
				&& !player.flags.stuned && player.stockedCapacity && player.stockedCapacity !== PLAYER_CAPACITY.SMASH)
			{
				player.capacityLoaderPercentage = 100;
				player.capacityTimeTrigger = this.mSecElapsed;
				if (player.stockedCapacity === PLAYER_CAPACITY.STUNNING) {
					if (player === this.playerOne)
						this.playerTwo.flags.stuned = true;
					else
						this.playerOne.flags.stuned = true;
				}
			}
		}
	}

	private capacityUnlocker(currentPlayer: PlayerState) {
		if (this.gameOptions.gameType === "extended" && currentPlayer.capacityUnlockerPercentage !== 100) {
			let points : number = 0;
			if (!this.ballState.directionVector.y) {
				points = 2;
			} else {
				if (this.ballState.directionVector.y < 0)
					points = 10 / (((this.ballState.directionVector.y * -10) - 10)) * -2;
				else
					points = 10 / (((this.ballState.directionVector.y * 10) - 10)) * -2;
			}
			if (this.ballState.flags.smash)
				points *= 2;
			currentPlayer.capacityUnlockerPercentage += points;
			if (currentPlayer.capacityUnlockerPercentage > 100)
				currentPlayer.capacityUnlockerPercentage = 100;
			if (currentPlayer.capacityUnlockerPercentage === 100)
				currentPlayer.stockedCapacity = Math.random() > 0.5 ? PLAYER_CAPACITY.STUNNING : PLAYER_CAPACITY.SMASH;
		}
	}

	// PUBLIC FUNCTIONS

	/* debouncer du bled */
	updatePlayerNetState(playerId: number, state: boolean) {
		if (playerId === this.playerOne.id) {
			if (state) {
				if (this.playersDisconnectTimer[0]) {
					clearTimeout(this.playersDisconnectTimer[0]);
					this.playersDisconnectTimer[0] = 0;
				}
				this.playerOne.connected = true;
			} else {
				if (!this.playersDisconnectTimer[0])
					this.playersDisconnectTimer[0] = setTimeout(() => {
						this.playerOne.connected = false;
						this.playersDisconnectTimer[0] = 0;
						this.globalFreezeSetter();
						this.forceGlobalFreeze = true;
					}, 500) as unknown as number;
			}
		}
		else if (playerId === this.playerTwo.id) {
			if (state) {
				if (this.playersDisconnectTimer[1]) {
					clearTimeout(this.playersDisconnectTimer[1]);
					this.playersDisconnectTimer[1] = 0;
				}
				this.playerTwo.connected = true;
			} else {
				if (!this.playersDisconnectTimer[1])
					this.playersDisconnectTimer[1] = setTimeout(() => {
						this.playerTwo.connected = false;
						this.playersDisconnectTimer[1] = 0;
						this.globalFreezeSetter();
						this.forceGlobalFreeze = true;
					}, 500) as unknown as number;
			}
		}
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