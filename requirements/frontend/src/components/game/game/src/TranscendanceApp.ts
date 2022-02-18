import { Application, IApplicationOptions } from "pixi.js";
import { GameClientInstance } from "../GameClientInstance";
import { RacketUnit } from "./game_scene/racket/Racket";
import { ScenesManager } from "./ScenesManager";

class TranscendanceApp extends Application {
	userId: number;
	playerRacket: RacketUnit = RacketUnit.NONE;
	gciMaster: GameClientInstance;
	manager: ScenesManager;
	actualKeysPressed : { // controls
		up: boolean, down: boolean, space: boolean
	} = { up: false, down: false, space: false };

	constructor(
		gciMaster: GameClientInstance,
		userId: number,
		options?: IApplicationOptions | undefined
	) {
		super(options);
		this.gciMaster = gciMaster;
		this.userId = userId;
		this.manager = new ScenesManager(this);
	}
}

export { TranscendanceApp };