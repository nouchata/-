import { BallState } from "./BallState";
import { GameOptions } from "./GameOptions";
import { PlayerState } from "./PlayerState";

enum RUNSTATE {
	WAITING,
	RUNNING,
	PLAYER_DISCONNECTED,
	AFTER_GAME,
	ENDED
};

export type ResponseState = {
	// game related
	instanceId: number;
	gameOptions: GameOptions;
	mSecElipsed: number;
	runState: RUNSTATE;
	ballState: BallState;

	// player related
	playerOne: PlayerState;
	playerTwo: PlayerState;
	playerOneLastActionProcessed: number;
	playerTwoLastActionProcessed: number;
};

export { RUNSTATE };