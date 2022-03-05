import { Container } from "pixi.js";
import { IContainerElement, IParticleContainerElement, IScene } from "../../types/IScene";
import { TranscendanceApp } from "../TranscendanceApp";
import { GameComponents } from "./GameComponents";
import PlayerScoreGUI from "./gui/PlayerScoreGUI";

class GameScene extends Container implements IScene {
	private appRef : TranscendanceApp;
	private gameComps : GameComponents;
	private scoreGUI : Array<PlayerScoreGUI> = [];
	public newScore : boolean = false;

	constructor(appRef : TranscendanceApp) {
		super();
		this.appRef = appRef;

		this.gameComps = new GameComponents(this.appRef);
		this.scoreGUI = [
			new PlayerScoreGUI(this.appRef, this, this.gameComps.leftRacket),
			new PlayerScoreGUI(this.appRef, this, this.gameComps.rightRacket)
		];
		this.addChild(this.scoreGUI[0]);
		this.addChild(this.scoreGUI[1]);
		this.addChild(this.gameComps);

		this.appRef.ticker.add(this.update, this);
	}

	update(delta: number) {
		if (this.newScore) {
			this.gameComps.ball.resetData();
			this.gameComps.leftRacket.resetData();
			this.gameComps.rightRacket.resetData();
			this.newScore = false;
		}
	}

	destroyScene() {
		for (let item of this.children)
			(item as IContainerElement | IParticleContainerElement).destroyContainerElem();
		this.destroy();
	}
};

export { GameScene };