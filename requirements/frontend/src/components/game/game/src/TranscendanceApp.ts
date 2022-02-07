import { Application, IApplicationOptions } from "pixi.js";
import { PlayerRacketUnit } from "./game_scene/PlayerRacket";

class TranscendanceApp extends Application {
	userId: number;
	playerRacket: PlayerRacketUnit = PlayerRacketUnit.NONE;
	actualKeysPressed : { // controls
		up: boolean, down: boolean, space: boolean
	} = { up: false, down: false, space: false };

	constructor(
		userId: number,
		options?: IApplicationOptions | undefined
	) {
		super(options);
		this.userId = userId;
	}
}

export { TranscendanceApp };