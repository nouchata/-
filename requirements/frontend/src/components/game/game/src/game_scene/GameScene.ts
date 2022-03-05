import { BitmapFont, Container } from "pixi.js";
import { IContainerElement, IParticleContainerElement, IScene } from "../../types/IScene";
import { ResponseState } from "../../types/ResponseState";
import { TranscendanceApp } from "../TranscendanceApp";
import { GameComponents } from "./GameComponents";
import PlayerDataGUI from "./gui/PlayerDataGUI";
import { RacketUnit } from "./racket/Racket";

class GameScene extends Container implements IScene {
	private appRef : TranscendanceApp;
	private gameComps : GameComponents;
	private playersGUI : Array<PlayerDataGUI> = [];

	constructor(appRef : TranscendanceApp) {
		super();
		this.appRef = appRef;

		this.gameComps = new GameComponents(this.appRef);
		if ((this.appRef.gciMaster.currentResponseState as ResponseState).gameOptions.gameType === "extended") {
			this.playersGUI = [
				new PlayerDataGUI(this.appRef, this.gameComps, this.gameComps.rightRacket),
				new PlayerDataGUI(this.appRef, this.gameComps, this.gameComps.leftRacket)
			];
			this.addChild(this.playersGUI[0]);
			this.addChild(this.playersGUI[1]);
		}
		this.addChild(this.gameComps);
	}

	destroyScene() {
		for (let item of this.children)
			(item as IContainerElement | IParticleContainerElement).destroyContainerElem();
		this.destroy();
	}
};

export { GameScene };