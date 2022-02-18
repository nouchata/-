import { OldEmitterConfig } from "pixi-particles";

export const ballEmitterData : OldEmitterConfig = {
	alpha: {
		start: 0,
		end: 0.5
	},
	scale: {
		start: 0.5,
		end: 0.5,
		minimumScaleMultiplier: 1
	},
	color: {
		start: "#ffffff",
		end: "#ffffff"
	},
	speed: {
		start: 80,
		end: 0,
		minimumSpeedMultiplier: 1
	},
	acceleration: {
		x: 0,
		y: 0
	},
	maxSpeed: 0,
	startRotation: {
		min: 0,
		max: 360
	},
	noRotation: true,
	rotationSpeed: {
		min: 5,
		max: 0
	},
	lifetime: {
		min: 0.2,
		max: 0.9
	},
	blendMode: "screen",
	frequency: 0.1,
	emitterLifetime: -1,
	maxParticles: 50,
	pos: {
		x: 0,
		y: 0
	},
	addAtBack: true,
	spawnType: "rect",
	spawnRect: {
		x: 0,
		y: 0,
		w: 1,
		h: 1
	}
};

export const ballEmitterDataMinimized : OldEmitterConfig = {
	alpha: {
		start: 0,
		end: 0.5
	},
	scale: {
		start: 0.3,
		end: 0.3,
		minimumScaleMultiplier: 1
	},
	color: {
		start: "#ffffff",
		end: "#ffffff"
	},
	speed: {
		start: 50,
		end: 0,
		minimumSpeedMultiplier: 1
	},
	acceleration: {
		x: 0,
		y: 0
	},
	maxSpeed: 0,
	startRotation: {
		min: 0,
		max: 360
	},
	noRotation: true,
	rotationSpeed: {
		min: 5,
		max: 0
	},
	lifetime: {
		min: 0.2,
		max: 0.9
	},
	blendMode: "screen",
	frequency: 0.15,
	emitterLifetime: -1,
	maxParticles: 50,
	pos: {
		x: 0,
		y: 0
	},
	addAtBack: true,
	spawnType: "rect",
	spawnRect: {
		x: 0,
		y: 0,
		w: 1,
		h: 1
	}
}