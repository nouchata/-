import { AdvancedBloomFilter } from "@pixi/filter-advanced-bloom";
import { GlitchFilter } from "@pixi/filter-glitch";
import { Container, Filter, Graphics, PI_2, Rectangle } from "pixi.js";
import { GA_KEY } from "../../types/GameAction";
import { PlayerRacketFlags } from "../../types/PlayerRacketFlags";
import { PlayerState } from "../../types/PlayerState";
import { ResponseState } from "../../types/ResponseState";
import { TranscendanceApp } from "../TranscendanceApp";

const rSS : {
	width: number,
	heightFactor: number,
	thickness: number 
} = {
	width: 10,
	heightFactor: 6,
	thickness: 3
} // racketShapeSize

// client
const filterAreaFactor = 150;
const angleFactor = 2;
const borderDistFactor = 20;

// server
const defaultScreenHeightPercentagePerSec = 50;
const capChargingPercentagePerSec = 100 / 3;

enum PlayerRacketUnit {
	NONE,
	LEFT,
	RIGHT
};

function toPer(value: number, currScreenSize: number) : number {
	return ((value / (currScreenSize / 100)));
} // to percentages

function toPx(value: number, screenHeight: number) {
	return (value * (screenHeight / 100));
} // to screen scale

class PlayerRacket extends Container {
	private unit : PlayerRacketUnit;
	private appRef : TranscendanceApp;
	private shape : Graphics = new Graphics();
	private deltaTotal : number = 0;
	private movSpeed : number = defaultScreenHeightPercentagePerSec;
	private capacityLoader : number = 0;
	private racketColor : number = 0xFFFFFF;
	private currScreenSize : number = 0;

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

	constructor(appRef : TranscendanceApp, unit : PlayerRacketUnit) {
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
		window.addEventListener("resizeGame", this.resize.bind(this));
		if (this.appRef.playerRacket === this.unit)
			this.actualKeysPressed = this.appRef.actualKeysPressed;

		// ticker
		if (this.appRef.playerRacket === this.unit)
			this.appRef.ticker.add(this.updatePlayer, this);
		else
			this.appRef.ticker.add(this.updateSpectator, this);
	}

	updateSpectator(delta: number) {
		let actualPerPos: number = toPer(this.absolutePosition.y, this.currScreenSize);
		this.deltaTotal += delta;

		let playerData : PlayerState = this.unit === PlayerRacketUnit.LEFT ?
		(this.appRef.gciMaster.currentResponseState as ResponseState).playerOne :
		(this.appRef.gciMaster.currentResponseState as ResponseState).playerTwo;

		if (actualPerPos > playerData.pos.y) { // to top
			// lag proof smooth movement or teleportation if there's too much delay (10% ahead for a 50% per sec)
			if (actualPerPos - playerData.pos.y > (this.appRef.gciMaster.currentResponseState as ResponseState).gameOptions.yDistPPS / 5)
				this.absolutePosition.y = playerData.pos.y;
			else
				this.manageMovementSpectator(delta, toPx(playerData.pos.y, this.appRef.screen.height));
		} else if (actualPerPos < playerData.pos.y) {
			if (playerData.pos.y - actualPerPos > (this.appRef.gciMaster.currentResponseState as ResponseState).gameOptions.yDistPPS / 5)
				this.absolutePosition.y = playerData.pos.y;
			else
				this.manageMovementSpectator(delta, toPx(playerData.pos.y, this.appRef.screen.height));
		}

		if (this.filterState.update) {
			this.filterState.update = false;
			this.filters = this.filterState.array;
		}
	}

	updatePlayer(delta: number) {
		this.deltaTotal += delta;

		this.actualKeysPressed = this.appRef.actualKeysPressed;

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
	}

	resize() {
		// racket redrawing
		this.draw();

		this.updateSpatials({ pivot: true, filterArea: true, positionX: true });
		// responsive height
		this.absolutePosition.y = toPx(toPer(this.absolutePosition.y, this.currScreenSize), this.appRef.screen.height);
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

	private manageMovement(delta: number) {
		if (this.actualKeysPressed.up && this.absolutePosition.y > this.appRef.screen.height / rSS.heightFactor / 2) {
			// movement
			if (this.absolutePosition.y - (((this.appRef.screen.height / 100 * this.movSpeed) / this.appRef.ticker.FPS) * delta) > this.appRef.screen.height / rSS.heightFactor / 2)
				this.absolutePosition.y = this.absolutePosition.y - (((this.appRef.screen.height / 100 * this.movSpeed) / this.appRef.ticker.FPS) * delta);
			else
				this.absolutePosition.y = this.appRef.screen.height / rSS.heightFactor / 2;
			// not update if it's an absolute animation bc itll do itself
			if (!this.flags.falsePosAnimation)
				this.y = this.absolutePosition.y;
			// upload if not spectator
			if (this.appRef.playerRacket) {
				this.appRef.gciMaster.lastLocalGameActionComputed++;
				this.appRef.gciMaster.computedGameActions[this.appRef.gciMaster.lastLocalGameActionComputed] = {
					id: this.appRef.gciMaster.lastLocalGameActionComputed,
					keyPressed: GA_KEY.UP,
					data: { y: (this.absolutePosition.y / (this.currScreenSize / 100)) }
				};
			}
		} else if (this.actualKeysPressed.down && this.absolutePosition.y < this.appRef.screen.height - this.appRef.screen.height / rSS.heightFactor / 2) {
			if (this.absolutePosition.y + (((this.appRef.screen.height / 100 * this.movSpeed) / this.appRef.ticker.FPS) * delta) < this.appRef.screen.height - this.appRef.screen.height / rSS.heightFactor / 2)
				this.absolutePosition.y = this.absolutePosition.y + (((this.appRef.screen.height / 100 * this.movSpeed) / this.appRef.ticker.FPS) * delta);
			else
				this.absolutePosition.y = this.appRef.screen.height - this.appRef.screen.height / rSS.heightFactor / 2;
			if (!this.flags.falsePosAnimation)
				this.y = this.absolutePosition.y;
			if (this.appRef.playerRacket) {
				this.appRef.gciMaster.lastLocalGameActionComputed++;
				this.appRef.gciMaster.computedGameActions[this.appRef.gciMaster.lastLocalGameActionComputed] = {
					id: this.appRef.gciMaster.lastLocalGameActionComputed,
					keyPressed: GA_KEY.DOWN,
					data: { y: (this.absolutePosition.y / (this.currScreenSize / 100)) }
				};
			}
		}
	}

	private manageMovementSpectator(delta: number, spectatorValue: number) {
		if (this.absolutePosition.y > spectatorValue) {
			// movement
			if (this.absolutePosition.y - (((this.appRef.screen.height / 100 * this.movSpeed) / this.appRef.ticker.FPS) * delta) > spectatorValue)
				this.absolutePosition.y = this.absolutePosition.y - (((this.appRef.screen.height / 100 * this.movSpeed) / this.appRef.ticker.FPS) * delta);
			else
				this.absolutePosition.y = spectatorValue;
			// not update if it's an absolute animation bc itll do itself
			if (!this.flags.falsePosAnimation)
				this.y = this.absolutePosition.y;
		} else if (this.absolutePosition.y < spectatorValue) {
			if (this.absolutePosition.y + (((this.appRef.screen.height / 100 * this.movSpeed) / this.appRef.ticker.FPS) * delta) < spectatorValue)
				this.absolutePosition.y = this.absolutePosition.y + (((this.appRef.screen.height / 100 * this.movSpeed) / this.appRef.ticker.FPS) * delta);
			else
				this.absolutePosition.y = spectatorValue;
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
		if (!this.flags.rainbowing && this.racketColor !== 0xFFFFFF)
			this.racketColor = 0xFFFFFF;
	}
}

export { PlayerRacket, PlayerRacketUnit };