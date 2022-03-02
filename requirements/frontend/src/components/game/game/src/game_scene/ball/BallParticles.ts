import { Container, Loader, ParticleContainer, Resource, Texture, TextureSource } from "pixi.js";
import { Emitter, OldEmitterConfig } from "pixi-particles";
import { IParticleContainerElement } from "../../../types/IScene";
import { TranscendanceApp } from "../../TranscendanceApp";
import { ballEmitterData, ballEmitterDataMinimized } from "./_emittersOptions";
import { Ball } from "./Ball";

class BallParticles extends ParticleContainer implements IParticleContainerElement {
	private appRef : TranscendanceApp;
	private parentContainer : Container;
	private currentEmitter : Emitter;
	private emitters : Array<Emitter> = [];
	private deltaTotal : number = 0;
	private ballContainer : Ball | undefined;

	constructor(appRef : TranscendanceApp, parentContainer : Container) {
		super();
		this.appRef = appRef;
		this.parentContainer = parentContainer;

		this.emitters[0] = new Emitter(this, Texture.from("pixel25"), ballEmitterData);
		this.emitters[1] = new Emitter(this, Texture.from("pixel25"), ballEmitterDataMinimized);
		this.currentEmitter = this.appRef.screen.height < 470 ? this.emitters[1] : this.emitters[0];

		this.ballContainer = (this.parentContainer.children.filter((elem) => elem instanceof Ball))[0] as Ball;

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
			this.currentEmitter.emit = !this.ballContainer?.localBallState.flags.freezed;
		if (this.ballContainer)
			this.currentEmitter.updateSpawnPos(this.ballContainer.x, this.ballContainer.y);
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