import { Easing, Tween, update as tweenUpdate } from "@tweenjs/tween.js";
import { Container, Graphics } from "pixi.js";
import { IContainerElement } from "../../types/IScene";
import { ResponseState } from "../../types/ResponseState";
import { TranscendanceApp } from "../TranscendanceApp";
import { Ball } from "./ball/Ball";
import { BallParticles } from "./ball/BallParticles";
import PlayerPowerGUI from "./gui/PlayerPowerGUI";
import { PlayerRacket } from "./racket/PlayerRacket";
import { RacketUnit } from "./racket/Racket";
import { SpectatorRacket } from "./racket/SpectatorRacket";

class GameComponents extends Container implements IContainerElement {
	private appRef : TranscendanceApp;
	private deltaTotal : number = 0;
	private shakeRightAnimation : Tween<{x: number}>;
	public leftRacket : PlayerRacket | SpectatorRacket;
	public rightRacket : PlayerRacket | SpectatorRacket;
	public ball : Ball;
	private ballParticles : BallParticles;
	private fieldSeparator : Graphics = new Graphics();
	private playersGUI : Array<PlayerPowerGUI> = [];
	shakeState : "left" | "right" | undefined = undefined;

	constructor(appRef : TranscendanceApp) {
		super();
		this.appRef = appRef;
	
		this.leftRacket = this.appRef.playerRacket === RacketUnit.LEFT ? new PlayerRacket(this.appRef, RacketUnit.LEFT) : new SpectatorRacket(this.appRef, RacketUnit.LEFT);
		this.rightRacket = this.appRef.playerRacket === RacketUnit.RIGHT ? new PlayerRacket(this.appRef, RacketUnit.RIGHT) : new SpectatorRacket(this.appRef, RacketUnit.RIGHT);
		this.ball = new Ball(this.appRef, this);
		this.ballParticles = new BallParticles(this.appRef, this);
		
		if ((this.appRef.gciMaster.currentResponseState as ResponseState).gameOptions.gameType === "extended") {
			this.playersGUI = [
				new PlayerPowerGUI(this.appRef, this.rightRacket),
				new PlayerPowerGUI(this.appRef, this.leftRacket)
			];
			this.addChild(this.playersGUI[0]);
			this.addChild(this.playersGUI[1]);
		}
		this.addChild(this.fieldSeparator);
		this.addChild(this.leftRacket);
		this.addChild(this.rightRacket);
		this.addChild(this.ball);
		this.addChild(this.ballParticles);
		this.fieldSeparator.alpha = 0.4;

		this.resize();
		this.shakeRightAnimation = new Tween({ x: 0 }).stop()
			.to({ x: 4 }, 2)
			.easing(Easing.Back.InOut)
			.onUpdate((object) => {
				this.pivot.x = (this.appRef.screen.width / 2);
				this.pivot.x += this.shakeState === "right" ?
					(this.appRef.screen.width / 100 * object.x) :
					(this.appRef.screen.width / 100 * object.x) * -1;
			})
			.onComplete(() => {
				this.shakeState = undefined;
				this.pivot.set(this.x, this.y);
			})
			.repeat(1).yoyo(true);

		window.addEventListener("resizeGame", this.resize as EventListenerOrEventListenerObject);
		this.appRef.ticker.add(this.update, this);
	}

	resize : Function = (function(this: GameComponents) {
		// field separator
		try {
			this.fieldSeparator.clear();
		} catch {}
		this.fieldSeparator.beginFill(0xFFFFFF);
		this.fieldSeparator.drawRect(this.appRef.screen.width / 2 - 1, 0, 3, this.appRef.screen.height);
		this.fieldSeparator.endFill();

		this.x = this.appRef.screen.width / 2;
		this.y = this.appRef.screen.height / 2;
		this.pivot.set(this.x, this.y);
	}).bind(this);

	update(delta: number) {
		this.deltaTotal += delta;
		if (this.shakeState && !this.shakeRightAnimation.isPlaying())
			this.shakeRightAnimation.start(this.deltaTotal);
		tweenUpdate(this.deltaTotal);
	}

	public destroy() {
		this.appRef.ticker.remove(this.update, this);
		window.removeEventListener("resizeGame", this.resize as EventListenerOrEventListenerObject);
		this.shakeRightAnimation.stop();
		this.fieldSeparator.destroy();
		this.leftRacket.destroy();
		this.rightRacket.destroy();
		this.ball.destroy();
		this.ballParticles.destroy();
		for (let playerGUI of this.playersGUI)
			playerGUI.destroy();
		super.destroy();
	}
}

export { GameComponents };