import { Container } from "pixi.js";

export interface IScene extends Container {
	destroyScene: Function;
};

export interface IContainerElement extends Container {
	destroyContainerElem: Function;
	resize: Function;
};

export interface IParticleContainerElement extends Container {
	destroyContainerElem: Function;
	resize: Function;
};