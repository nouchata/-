import { Application, IApplicationOptions } from "pixi.js";
import { GameClientInstance } from "../GameClientInstance";
import { PlayerRacketUnit } from "./game_scene/PlayerRacket";

class TranscendanceApp extends Application {
	userId: number;
	playerRacket: PlayerRacketUnit = PlayerRacketUnit.NONE;
	gciMaster: GameClientInstance;
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
	}
}

export { TranscendanceApp };