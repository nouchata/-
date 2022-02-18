import { AdvancedBloomFilter } from "@pixi/filter-advanced-bloom";
import { GlitchFilter } from "@pixi/filter-glitch";
import { Container, Filter, Graphics, PI_2, Rectangle } from "pixi.js";
import { GA_KEY } from "../../../types/GameAction";
import { RacketFlags } from "../../../types/RacketFlags";
import { PlayerState } from "../../../types/PlayerState";
import { ResponseState } from "../../../types/ResponseState";
import { TranscendanceApp } from "../../TranscendanceApp";
import { IContainerElement } from "../../../types/IScene";

const rSS : {
	width: number,
	thickness: number 
} = {
	width: 10,
	thickness: 3
} // racketShapeSize

// client
const angleFactor = 2;

// server
const defaultScreenHeightPercentagePerSec = 50;
const capChargingPercentagePerSec = 100 / 3;

enum RacketUnit {
	NONE,
	LEFT,
	RIGHT
};

function toPer(value: number, screenValue: number) : number {
	return (value / (screenValue / 100));
} // to percentages

function toPx(value: number, screenValue: number) : number {
	return (value * (screenValue / 100));
} // to screen scale

class Racket extends Container implements IContainerElement {
	unit : RacketUnit;
	protected appRef : TranscendanceApp;
	protected shape : Graphics = new Graphics();
	protected deltaTotal : number = 0;
	protected movSpeed : number = defaultScreenHeightPercentagePerSec;
	protected capacityLoader : number = 0;
	protected localCapacityChargingState: boolean = false;
	protected racketColor : number = 0xFFFFFF;
	protected currScreenSize : number = 0;

	absolutePosition : { x: number, y: number };

	protected filterState : {
		update: boolean, array: Array<Filter>
	} = { update: false, array: [] };

	protected flags : RacketFlags = {
		falsePosAnimation: false,
		capacityCharging: false,
		stuned: false,
		rainbowing: false
	};

	constructor(appRef : TranscendanceApp, unit : RacketUnit) {
		super();

		this.appRef = appRef;
		this.unit = unit;

		// racket settings
		this.currScreenSize = this.appRef.screen.height;

		// racket drawing
		this.draw();

		// container settings
		this.addChild(this.shape);
		
		// server copying
		this.localCapacityChargingState = (this.selectCorrectUnit() as PlayerState).flags.capacityCharging;
		this.y = toPx((this.selectCorrectUnit() as PlayerState).pos.y, this.appRef.screen.height);

		this.updateSpatials({ pivot: true, filterArea: true, positionX: true });
		this.absolutePosition = { x: this.x, y: this.y };

		this.filterState.update = true;
		this.filterState.array = [new AdvancedBloomFilter({ blur: 5 })];

		// triggers
		window.addEventListener("resizeGame", this.resize as EventListenerOrEventListenerObject);
	}

	resize : Function = (function(this: Racket) {
		// racket redrawing
		this.draw();

		this.updateSpatials({ pivot: true, filterArea: true, positionX: true });
		// responsive height
		this.absolutePosition.y = toPx(toPer(this.absolutePosition.y, this.currScreenSize), this.appRef.screen.height);
		if (!this.flags.falsePosAnimation)
			this.y = this.absolutePosition.y;
		this.currScreenSize = this.appRef.screen.height;
	}).bind(this);

	protected updateSpatials(
		options : { pivot? : boolean, filterArea? : boolean, positionX?: boolean }
	) {
		if (options.positionX) {
			if (!this.flags.falsePosAnimation) {
				this.x = this.unit === RacketUnit.LEFT ? this.appRef.screen.width / 100 * 3 : this.appRef.screen.width - this.appRef.screen.width / 100 * 3;
				this.absolutePosition = { x: this.x, y: this.y };
			} else {
				this.absolutePosition.x = this.unit === RacketUnit.LEFT ? this.appRef.screen.width / 100 * 3 : this.appRef.screen.width - this.appRef.screen.width / 100 * 3;
			}
		}
		if (options.pivot)
			this.pivot.set(this.width / 2, this.height / 2);
		if (options.filterArea)
			this.filterArea = new Rectangle(
				0,
				0,
				this.appRef.screen.width,
				this.appRef.screen.height
			);
	}

	protected manageAngle(delta: number, key: GA_KEY) {
		if (key === GA_KEY.UP && this.y > this.appRef.screen.height / (this.appRef.gciMaster.currentResponseState as ResponseState).gameOptions.racketSize / 2) {
			if (this.angle > -angleFactor && this.unit === RacketUnit.RIGHT) {
				this.angle = this.angle - delta * 1 < -angleFactor ? -angleFactor : this.angle - delta * 1;
			} else if (this.angle < angleFactor && this.unit === RacketUnit.LEFT) {
				this.angle = this.angle + delta * 1 > angleFactor ? angleFactor : this.angle + delta * 1;
			}
		} else if (key === GA_KEY.DOWN && this.y < this.appRef.screen.height - this.appRef.screen.height / (this.appRef.gciMaster.currentResponseState as ResponseState).gameOptions.racketSize / 2) {
			if (this.angle < angleFactor && this.unit === RacketUnit.RIGHT) {
				this.angle = this.angle + delta * 1 > angleFactor ? angleFactor : this.angle + delta * 1;
			} else if (this.angle > -angleFactor && this.unit === RacketUnit.LEFT) {
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

	protected draw(color? : number) {
		this.shape.clear();
		this.shape.beginFill(this.racketColor);
		this.shape.drawRect(0, 0, rSS.thickness, 
			this.appRef.screen.height / (this.appRef.gciMaster.currentResponseState as ResponseState).gameOptions.racketSize);
		this.shape.drawRect(this.appRef.screen.width / 100 * 1, 0, rSS.thickness, 
			this.appRef.screen.height / (this.appRef.gciMaster.currentResponseState as ResponseState).gameOptions.racketSize);
		this.shape.drawRect(0, 0, this.appRef.screen.width / 100 * 1, rSS.thickness);
		this.shape.drawRect(0, this.appRef.screen.height /
			(this.appRef.gciMaster.currentResponseState as ResponseState).gameOptions.racketSize - rSS.thickness, this.appRef.screen.width / 100 * 1, rSS.thickness);

		if (this.capacityLoader)
			this.shape.drawRect(
				0,
				this.appRef.screen.height / (this.appRef.gciMaster.currentResponseState as ResponseState).gameOptions.racketSize,
				this.appRef.screen.width / 100 * 1,
				-(this.capacityLoader * (this.appRef.screen.height / (this.appRef.gciMaster.currentResponseState as ResponseState).gameOptions.racketSize) / 100)
			);

		this.shape.endFill();
	}

	protected rainbowingRacket(delta: number) : boolean {
		const colorFactor : number = 1000;

		if ((this.selectCorrectUnit() as PlayerState).flags.rainbowing) {
			this.racketColor -= this.racketColor - colorFactor * delta < 0 ? 0xFFFFFF : colorFactor * delta;
			return (true);
		}
		if (!(this.selectCorrectUnit() as PlayerState).flags.rainbowing && this.racketColor !== 0xFFFFFF) {
			this.racketColor = 0xFFFFFF;
			return (true);
		}
		return (false);
	}

	protected selectCorrectUnit(getLastActionProcessed?: boolean) : PlayerState | number {
		if (this.unit === RacketUnit.LEFT)
			return (getLastActionProcessed ? 
				(this.appRef.gciMaster.currentResponseState as ResponseState).playerOneLastActionProcessed :
				(this.appRef.gciMaster.currentResponseState as ResponseState).playerOne
			);
		return (getLastActionProcessed ? 
			(this.appRef.gciMaster.currentResponseState as ResponseState).playerTwoLastActionProcessed :
			(this.appRef.gciMaster.currentResponseState as ResponseState).playerTwo
		);
	}

	public getCollisionShape() : Rectangle {
		return (new Rectangle(
			this.absolutePosition.x - (this.width / 2),
			this.absolutePosition.y - (this.height / 2),
			this.width,
			this.height
		));
	}

	public destroyContainerElem () {
		this.shape.destroy();
		window.removeEventListener("resizeGame", this.resize as EventListenerOrEventListenerObject);
		this.destroy();
	}
}

export { Racket, RacketUnit, toPer, toPx };