import { Container } from "pixi.js";

export interface IScene extends Container {
};

export interface IContainerElement extends Container {
	resize: Function;
};

export interface IParticleContainerElement extends Container {
	resize: Function;
};