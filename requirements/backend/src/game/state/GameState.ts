import { GameOptions } from "../types/GameOptions";
import { PlayerState } from "../types/PlayerState";
import { StateSettings } from "../types/StateSettings";
import { Server } from 'socket.io';

const samplePlayer : PlayerState = {
	id: 0,
	connected: false,
	pos: { x: undefined, y: 50 },
	flags: {
		falsePosAnimation: false,
		capacityCharging: false,
		stunted: false,
		rainbowing: false
	},
	capacityLoaderPercentage: 0,
	stockedCapacity: undefined
};

enum RUNSTATE {
	WAITING,
	ABOUT_TO_RUN,
	RUNNING,
	PLAYER_DISCONNECTED,
	ENDED
};

class GameState {
	// class related
	private runState : RUNSTATE = RUNSTATE.WAITING;

	private mSecElapsed : number = 0;
	/* used to define a condition based on time elapsed */
	private runStateSecCondition : number = 0;
	private instanceId : number;
	private gameInstances : { [instanceId: number]: GameState | undefined };
	private associatedPlayers : { [userId: number]: number | undefined };

	// ws related
	private wsServer : Server;
	private wsRoom : string;

	// game related
	private gameOptions : GameOptions = {
		gameType: "standard",
		capChargingPPS: 100 / 3,
		yDistPPS: 50,
		racketSize: 6
	};

	// player related
	private playerOne : PlayerState;
	private playerTwo : PlayerState;

	constructor(
		stateSettings : StateSettings,
		givenGameOptions? : Partial<GameOptions>
	) {
		if (givenGameOptions)
			Object.assign(this.gameOptions, givenGameOptions);

		// class vars
		this.instanceId = stateSettings.instanceId;
		this.gameInstances = stateSettings.gameInstances;
		this.associatedPlayers = stateSettings.associatedPlayers;
		this.wsServer = stateSettings.wsServer;
		this.wsRoom = "game#" + this.instanceId;

		// player object creation
		Object.assign(this.playerOne, samplePlayer, { id: stateSettings.playersId.one });
		Object.assign(this.playerTwo, samplePlayer, { id: stateSettings.playersId.two });

		this.run();
	}

	private async run() {
		while (this.runState !== RUNSTATE.ENDED) {
			this.runStateHandler();

			this.wsServer.to(this.wsRoom).emit('stateUpdate', {});
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
				this.runStateSecCondition = this.mSecElapsed += 1000 * 120;
			if (this.playerOne.connected && this.playerTwo.connected)
				this.runState = RUNSTATE.ABOUT_TO_RUN;
			else if (this.runStateSecCondition === this.mSecElapsed) {
				this.runStateSecCondition = 0;
				this.runState = RUNSTATE.ENDED;
			}
		}
		else if (this.runState === RUNSTATE.ABOUT_TO_RUN)
		{ // wait 5 seconds and launch the game
			if (!this.runStateSecCondition)
				this.runStateSecCondition = this.mSecElapsed += 1000 * 5;
			if (this.runStateSecCondition === this.mSecElapsed) {
				this.runStateSecCondition = 0;
				this.runState = RUNSTATE.RUNNING;
			}
		}
		else if (this.runState === RUNSTATE.RUNNING)
		{
			if (!this.playerOne.connected || !this.playerTwo.connected)
				this.runState = RUNSTATE.PLAYER_DISCONNECTED;
		}
		else if (this.runState === RUNSTATE.PLAYER_DISCONNECTED)
		{ // wait 2 minutes for player to connect again or kill the game
			if (!this.runStateSecCondition)
				this.runStateSecCondition = this.mSecElapsed += 1000 * 120;
			if (this.playerOne.connected && this.playerTwo.connected)
				this.runState = RUNSTATE.RUNNING;
			else if (this.runStateSecCondition === this.mSecElapsed) {
				this.runStateSecCondition = 0;
				this.runState = RUNSTATE.ENDED;
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
};

export { GameState };