import { Easing, Tween, update as tweenUpdate } from "@tweenjs/tween.js";
import { Container, Ticker } from "pixi.js";
import { IContainerElement, IParticleContainerElement, IScene } from "../../types/IScene";
import { TranscendanceApp } from "../TranscendanceApp";
import { Ball } from "./ball/Ball";
import { BallParticles } from "./ball/BallParticles";
import { PlayerRacket } from "./racket/PlayerRacket";
import { RacketUnit } from "./racket/Racket";
import { SpectatorRacket } from "./racket/SpectatorRacket";

class GameComponents extends Container implements IScene {
	private appRef : TranscendanceApp;
	private deltaTotal : number = 0;
	private shakeRightAnimation : Tween<{x: number}>;
	shakeState : "left" | "right" | undefined = undefined;

	constructor(appRef : TranscendanceApp) {
		super();
		this.appRef = appRef;
	
		const l_racket : PlayerRacket | SpectatorRacket = this.appRef.playerRacket === RacketUnit.LEFT ? new PlayerRacket(this.appRef, RacketUnit.LEFT) : new SpectatorRacket(this.appRef, RacketUnit.LEFT);
		this.addChild(l_racket);
		const r_racket : PlayerRacket | SpectatorRacket = this.appRef.playerRacket === RacketUnit.RIGHT ? new PlayerRacket(this.appRef, RacketUnit.RIGHT) : new SpectatorRacket(this.appRef, RacketUnit.RIGHT);
		this.addChild(r_racket);
		const ball : Ball = new Ball(this.appRef, this);
		this.addChild(ball);
		const ballParticles : BallParticles = new BallParticles(this.appRef, this);
		this.addChild(ballParticles);

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

	destroyScene() {
		for (let item of this.children)
			(item as IContainerElement | IParticleContainerElement).destroyContainerElem();
		this.destroy();
	}
}

export { GameComponents };