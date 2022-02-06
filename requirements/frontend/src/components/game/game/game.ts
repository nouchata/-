/* eslint-disable */

import { AdvancedBloomFilter } from '@pixi/filter-advanced-bloom';
import { GlitchFilter } from '@pixi/filter-glitch';
import { Application, Container, Filter, Graphics, LINE_JOIN, PI_2, Rectangle, Sprite, Text, UPDATE_PRIORITY } from 'pixi.js'
// import { PlayerRacket, PlayerRacketUnit } from './playerRacket';

const rSS : {
	width: number,
	heightFactor: number, 
	thickness: number 
} = {
	width: 10,
	heightFactor: 6,
	thickness: 3
} // racketShapeSize

const filterAreaFactor = 150;
const angleFactor = 2;
const borderDistFactor = 20;
const defaultScreenHeightPercentagePerSec = 50;
const capChargingPercentagePerSec = 100 / 3;

type PlayerRacketFlags = {
	/* stands for the not-meant-to-change-the-pos animations */
	falsePosAnimation: boolean,
	capacityCharging: boolean,
	stunted: boolean,
	rainbowing: boolean
};

enum PlayerRacketUnit {
	LEFT,
	RIGHT
};

class PlayerRacket extends Container {
	private unit : PlayerRacketUnit;
	private appRef : Application;
	private shape : Graphics = new Graphics();
	private deltaTotal : number = 0;
	private movSpeed : number = defaultScreenHeightPercentagePerSec;
	private capacityLoader : number = 0;
	private racketColor : number = 0xFFFFFF;
	private currScreenSize : number = 0;
	private glitchFilter = new GlitchFilter({
		// slices: 5
		offset: 10
		// direction: number
		// fillMode: number;
		// seed: number;
		// average: boolean;
		// minSize: number;
		// sampleSize: number;
	});

	private absolutePosition : { x: number, y: number };

	private filterState : {
		update: boolean, array: Array<Filter> 
	} = { update: false, array: [] };

	private actualKeysPressed : { // controls
		up: boolean, down: boolean, space: boolean
	} = { up: false, down: false, space: false };

	private flags : PlayerRacketFlags = {
		falsePosAnimation: false,
		capacityCharging: false,
		stunted: false,
		rainbowing: false
	};

	constructor(appRef : Application, unit : PlayerRacketUnit) {
		super();

		this.appRef = appRef;
		this.unit = unit;

		// racket settings
		this.currScreenSize = this.appRef.screen.height;

		// racket drawing
		this.draw();

		// container settings
		this.addChild(this.shape);
		this.y = this.appRef.screen.height / 2;
		this.updateSpatials({ pivot: true, filterArea: true, positionX: true });
		this.absolutePosition = { x: this.x, y: this.y };

		this.filterState.update = true;
		this.filterState.array = [new AdvancedBloomFilter({ blur: 5 })];

		// triggers
		window.addEventListener("resize", ((resizeCallback: Function) => {
			let flag : number = 0; // limit resize calls
			return (function() {
				if (flag) {
					window.clearTimeout(flag);
					flag = 0;
				}
				flag = setTimeout(resizeCallback, 100);
			});
		})(this.resize.bind(this)));
		window.addEventListener("keydown", this.onKeyDown.bind(this));
		window.addEventListener("keyup", this.onKeyUp.bind(this));

		// ticker
		this.appRef.ticker.add(this.update, this);
	}

	update(delta: number) {
		this.deltaTotal += delta;

		if (!this.actualKeysPressed.space && this.flags.capacityCharging) {
			this.flags.capacityCharging = false;
			this.flags.falsePosAnimation = false;
			this.flags.rainbowing = false;

			// sometimes there is pos artifacts after twitching w/out that
			this.x = this.absolutePosition.x;
			this.y = this.absolutePosition.y;
		}
		if (this.actualKeysPressed.space && !this.flags.capacityCharging /* && other conditions like having a power available */) {
			this.flags.capacityCharging = true;
			this.flags.falsePosAnimation = true;
			this.flags.rainbowing = true;
			this.capacityLoader = 0;
		}

		// various updates
		this.manageMovement(delta);
		this.manageAngle(delta);
		this.capacityCharging(delta);
		this.rainbowingRacket(delta);

		// filters update
		if (this.filterState.update) {
			this.filterState.update = false;
			this.filters = this.filterState.array;
		}
		this.glitchFilter.refresh();
	}

	resize() {
		// racket redrawing
		this.draw();

		this.updateSpatials({ pivot: true, filterArea: true, positionX: true });
		// responsive height
		this.absolutePosition.y = (this.absolutePosition.y / (this.currScreenSize / 100)) * (this.appRef.screen.height / 100);
		if (!this.flags.falsePosAnimation)
			this.y = this.absolutePosition.y;
		this.currScreenSize = this.appRef.screen.height;
	}

	updateSpatials(
		options : { pivot? : boolean, filterArea? : boolean, positionX?: boolean }
	) {
		if (options.positionX) {
			if (!this.flags.falsePosAnimation) {
				this.x = this.unit === PlayerRacketUnit.LEFT ? borderDistFactor : this.appRef.screen.width - borderDistFactor;
				this.absolutePosition = { x: this.x, y: this.y };
			} else {
				this.absolutePosition.x = this.unit === PlayerRacketUnit.LEFT ? borderDistFactor : this.appRef.screen.width - borderDistFactor;
			}
		}
		if (options.pivot)
			this.pivot.set(this.width / 2, this.height / 2);
		if (options.filterArea)
			this.filterArea = new Rectangle(
				this.x - filterAreaFactor,
				0 - filterAreaFactor,
				this.x + filterAreaFactor,
				this.appRef.screen.height + filterAreaFactor
			);
	}

	private onKeyDown(e: KeyboardEvent) {
		e.preventDefault();
		e.stopPropagation();
		if (e.key === "ArrowUp")
			this.actualKeysPressed.up = true;
		else if (e.key === "ArrowDown")
			this.actualKeysPressed.down = true;
		else if (e.key === " ")
			this.actualKeysPressed.space = true;
	}

	private onKeyUp(e: KeyboardEvent) {
		e.preventDefault();
		e.stopPropagation();
		if (e.key === "ArrowUp")
			this.actualKeysPressed.up = false;
		else if (e.key === "ArrowDown")
			this.actualKeysPressed.down = false;
		else if (e.key === " ") {
			this.actualKeysPressed.space = false;
		}
	}

	private manageMovement(delta: number) {
		if (this.actualKeysPressed.up && this.y > this.appRef.screen.height / rSS.heightFactor / 2) {
			// movement
			if (this.absolutePosition.y - (((this.appRef.screen.height / 100 * this.movSpeed) / 60) * delta) > this.appRef.screen.height / rSS.heightFactor / 2)
				this.absolutePosition.y = this.absolutePosition.y - (((this.appRef.screen.height / 100 * this.movSpeed) / 60) * delta);
			else
				this.absolutePosition.y = this.appRef.screen.height / rSS.heightFactor / 2;
			// not update if it's an absolute animation bc itll do itself
			if (!this.flags.falsePosAnimation)
				this.y = this.absolutePosition.y;
		} else if (this.actualKeysPressed.down && this.y < this.appRef.screen.height - this.appRef.screen.height / rSS.heightFactor / 2) {
			// movement
			if (this.absolutePosition.y + (((this.appRef.screen.height / 100 * this.movSpeed) / 60) * delta) < this.appRef.screen.height - this.appRef.screen.height / rSS.heightFactor / 2)
				this.absolutePosition.y = this.absolutePosition.y + (((this.appRef.screen.height / 100 * this.movSpeed) / 60) * delta);
			else
				this.absolutePosition.y = this.appRef.screen.height - this.appRef.screen.height / rSS.heightFactor / 2;
			// not update if it's an absolute animation bc itll do itself
			if (!this.flags.falsePosAnimation)
				this.y = this.absolutePosition.y;
		}
	}

	private manageAngle(delta: number) {
		if (this.actualKeysPressed.up && this.y > this.appRef.screen.height / rSS.heightFactor / 2) {
			if (this.angle > -angleFactor && this.unit === PlayerRacketUnit.RIGHT) {
				this.angle = this.angle - delta * 1 < -angleFactor ? -angleFactor : this.angle - delta * 1;
			} else if (this.angle < angleFactor && this.unit === PlayerRacketUnit.LEFT) {
				this.angle = this.angle + delta * 1 > angleFactor ? angleFactor : this.angle + delta * 1;
			}
		} else if (this.actualKeysPressed.down && this.y < this.appRef.screen.height - this.appRef.screen.height / rSS.heightFactor / 2) {
			if (this.angle < angleFactor && this.unit === PlayerRacketUnit.RIGHT) {
				this.angle = this.angle + delta * 1 > angleFactor ? angleFactor : this.angle + delta * 1;
			} else if (this.angle > -angleFactor && this.unit === PlayerRacketUnit.LEFT) {
				this.angle = this.angle - delta * 1 < -angleFactor ? -angleFactor : this.angle - delta * 1;
			}
		} else {
			if (this.angle) {
				if (this.angle < 0) {
					this.angle = this.angle + delta * 1 > 0 ? 0 : this.angle + delta * 1;
				} else {
					this.angle = this.angle - delta * 1 < 0 ? 0 : this.angle - delta * 1;
				}
			}
		}
	}

	private draw(color? : number) {
		this.shape.clear();
		this.shape.beginFill(this.racketColor);
		this.shape.drawRect(0, 0, rSS.thickness, 
			this.appRef.screen.height / rSS.heightFactor);
		this.shape.drawRect(rSS.width, 0, rSS.thickness, 
			this.appRef.screen.height / rSS.heightFactor);
		this.shape.drawRect(0, 0, rSS.width, rSS.thickness);
		this.shape.drawRect(0, this.appRef.screen.height /
			rSS.heightFactor - rSS.thickness, rSS.width, 3);

		if (this.capacityLoader)
			this.shape.drawRect(
				0,
				this.appRef.screen.height / rSS.heightFactor,
				rSS.width,
				-(this.capacityLoader * (this.appRef.screen.height / rSS.heightFactor) / 100)
			);

		this.shape.endFill();
	}

	private capacityCharging(delta: number) {
		if (this.flags.capacityCharging) {
			this.x = this.absolutePosition.x + (Math.cos(Math.random() * this.deltaTotal * 0.1) * (0.1 * this.capacityLoader));
			this.y = this.absolutePosition.y + (Math.sin(Math.random() * this.deltaTotal * 0.1) * (0.1 * this.capacityLoader));
			if (this.capacityLoader < 100) {
				this.capacityLoader = this.capacityLoader + delta * (capChargingPercentagePerSec / this.appRef.ticker.FPS) > 100 ? 100 : this.capacityLoader + delta * (capChargingPercentagePerSec / this.appRef.ticker.FPS);
				this.draw();
			}
		}
		if (this.capacityLoader && !this.flags.capacityCharging) {
			this.capacityLoader = this.capacityLoader - delta * (capChargingPercentagePerSec / this.appRef.ticker.FPS) < 0 ? 0 : this.capacityLoader - delta * (capChargingPercentagePerSec / this.appRef.ticker.FPS);
			this.x = this.absolutePosition.x;
			this.y = this.absolutePosition.y;
			this.draw();
		}
	}

	private rainbowingRacket(delta: number) {
		const colorFactor : number = 1000;

		if (this.flags.rainbowing) {
			this.racketColor -= this.racketColor - colorFactor * delta < 0 ? 0xFFFFFF : colorFactor * delta;
			if (this.flags.capacityCharging && this.capacityLoader === 100) // in some cases the drawx needs to be triggered here
				this.draw();
		}
		if (!this.flags.rainbowing && this.racketColor != 0xFFFFFF)
			this.racketColor = 0xFFFFFF;
	}
}










var app: Application;

export function exec() {
	app = new Application({
		view: document.getElementById("game-canvas") as HTMLCanvasElement,
		resolution: window.devicePixelRatio || 1,
		resizeTo: document.getElementsByClassName("game-display").item(0) as HTMLElement,
		antialias: true,
		autoDensity: true,
		// backgroundColor: 0x6495ed,
		backgroundColor: 0x000000,
		width: 500,
		height: 500
	});

	const text: Text = new Text('yes!', { fontFamily: 'arial', fontSize: 32, fill: 0xFFFFFF });
	// const zoneShow : Graphics = new Graphics();

	const l_racket : PlayerRacket = new PlayerRacket(app, PlayerRacketUnit.LEFT);
	const r_racket : PlayerRacket = new PlayerRacket(app, PlayerRacketUnit.RIGHT);

	text.pivot.set(text.width / 2, text.height / 2);
	text.x = app.screen.width / 2;
	text.y = app.screen.height / 10 * 9;
	text.angle = 0;

	window.addEventListener("resize", (function(ev: UIEvent) {
		text.x = app.screen.width / 2;
		text.y = app.screen.height / 10 * 9;

	}).bind(window));

	// app.stage.addChild(zoneShow);
	app.stage.addChild(text);
	app.stage.addChild(l_racket);
	app.stage.addChild(r_racket);
}