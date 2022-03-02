import { BitmapFont, Container } from "pixi.js";
import { IContainerElement, IParticleContainerElement, IScene } from "../../types/IScene";
import { TranscendanceApp } from "../TranscendanceApp";
import { GameComponents } from "./GameComponents";

class GameScene extends Container implements IScene {
	private appRef : TranscendanceApp;
	private gameComps : GameComponents;

	constructor(appRef : TranscendanceApp) {
		super();
		this.appRef = appRef;

		this.gameComps = new GameComponents(this.appRef);
		this.addChild(this.gameComps);
	}

	destroyScene() {
		for (let item of this.children)
			(item as IContainerElement | IParticleContainerElement).destroyContainerElem();
		this.destroy();
	}
};

export { GameScene };