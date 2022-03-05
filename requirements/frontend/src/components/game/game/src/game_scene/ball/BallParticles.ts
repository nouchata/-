import { ParticleContainer, Texture } from "pixi.js";
import { Emitter } from "pixi-particles";
import { IParticleContainerElement } from "../../../types/IScene";
import { TranscendanceApp } from "../../TranscendanceApp";
import { ballEmitterData, ballEmitterDataMinimized } from "./_emittersOptions";
import { GameComponents } from "../GameComponents";

class BallParticles extends ParticleContainer implements IParticleContainerElement {
	private appRef : TranscendanceApp;
	private parentContainer : GameComponents;
	private currentEmitter : Emitter;
	private emitters : Array<Emitter> = [];
	private deltaTotal : number = 0;

	constructor(appRef : TranscendanceApp, parentContainer : GameComponents) {
		super();
		this.appRef = appRef;
		this.parentContainer = parentContainer;

		this.emitters[0] = new Emitter(this, Texture.from("pixel25"), ballEmitterData);
		this.emitters[1] = new Emitter(this, Texture.from("pixel25"), ballEmitterDataMinimized);
		this.currentEmitter = this.appRef.screen.height < 470 ? this.emitters[1] : this.emitters[0];

		window.addEventListener("resizeGame", this.resize as EventListenerOrEventListenerObject);
		this.appRef.ticker.add(this.update, this);
	}

	resize: Function = (function(this: BallParticles) {
		this.emitters[0].emit = false;
		this.emitters[1].emit = false;
		this.currentEmitter.cleanup();
		this.currentEmitter = this.appRef.screen.height < 470 ? this.emitters[1] : this.emitters[0];
	}).bind(this);

	public update(delta: number) {
		this.deltaTotal += delta;
			this.currentEmitter.emit = !this.parentContainer.ball?.localBallState.flags.freezed;
		if (this.parentContainer.ball)
			this.currentEmitter.updateSpawnPos(this.parentContainer.ball.x, this.parentContainer.ball.y);
		this.currentEmitter.update(delta / this.appRef.ticker.FPS);
	}

	public destroyContainerElem() {
		window.removeEventListener("resizeGame", this.resize as EventListenerOrEventListenerObject);
		for (let emitter of this.emitters)
			emitter.destroy();
		this.destroy();
	}
}

export { BallParticles };