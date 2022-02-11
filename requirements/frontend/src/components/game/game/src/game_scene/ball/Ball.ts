import { Container, DisplayObject, Graphics, Point } from "pixi.js";
import { BallState } from "../../../types/BallState";
import { ResponseState } from "../../../types/ResponseState";
import { TranscendanceApp } from "../../TranscendanceApp";
import { Racket, RacketUnit, toPer, toPx } from "../racket/Racket";
import { Sound } from "@pixi/sound";
import "@pixi/math-extras";
import { GA_KEY } from "../../../types/GameAction";

const ballShapeStuff : {
	width: number,
	thickness: number 
} = {
	width: 10,
	thickness: 3
}

class Ball extends Container {
	protected appRef : TranscendanceApp;
	protected ballShape : Graphics;
	protected ballColor : number = 0xFFFFFF;
	protected ballSize : number = ballShapeStuff.width;
	protected deltaTotal : number = 0;
	protected lastCollision : number = 0;
	protected scaleFactor : number = 1;
	protected oldServerDirectionVector : { x: number, y: number } = { x: 0, y: 0 };
	protected oldServerPosVector : { x: number, y: number } = { x: 0, y: 0 };
	protected rackets : Racket[] = [];
	protected sweetCorrectionType : boolean = false;
	protected localBallState : BallState = {
		/* in percentage */
		pos: { x: 50, y: 50 },
		directionVector: { x: 1, y: 0.5 },
		headingRight: true,
		headingTop: true,
		speedPPS: 50,
		flags: {
			rainbow: false,
			smash: false,
			freezed: false,
			showed: false
		}
	};
	protected serverLastBallFlags : {
		rainbow: boolean;
		smash: boolean;
		freezed: boolean;
		showed: boolean;
	} = {
		rainbow: false,
		smash: false,
		freezed: false,
		showed: false
	};


	constructor(appRef : TranscendanceApp) {
		super();
		this.appRef = appRef;

		this.ballShape = new Graphics();

		this.addChild(this.ballShape);
		this.ballSize = this.appRef.screen.height / 50;
		if (this.ballSize > ballShapeStuff.width)
			this.ballSize = ballShapeStuff.width;
		this.draw();

		this.localBallState.pos.x = (this.appRef.gciMaster.currentResponseState as ResponseState).ballState.pos.x;
		this.localBallState.pos.y = (this.appRef.gciMaster.currentResponseState as ResponseState).ballState.pos.y;
		this.oldServerPosVector.x = (this.appRef.gciMaster.currentResponseState as ResponseState).ballState.pos.x;
		this.oldServerPosVector.y = (this.appRef.gciMaster.currentResponseState as ResponseState).ballState.pos.y;
		this.localBallState.directionVector.x = (this.appRef.gciMaster.currentResponseState as ResponseState).ballState.directionVector.x;
		this.localBallState.directionVector.y = (this.appRef.gciMaster.currentResponseState as ResponseState).ballState.directionVector.y;

		this.x = toPx(this.localBallState.pos.x, this.appRef.screen.width);
		this.y = toPx(this.localBallState.pos.y, this.appRef.screen.height);

		let x : DisplayObject[] = this.appRef.stage.children.filter((elem) => elem instanceof Racket);
		this.rackets[0] = (x[0] as Racket).unit === RacketUnit.LEFT ? x[0] as Racket : x[1] as Racket;
		this.rackets[1] = (x[0] as Racket).unit === RacketUnit.LEFT ? x[1] as Racket : x[0] as Racket;

		window.addEventListener("resizeGame", this.resize.bind(this));
		this.appRef.ticker.add(this.update, this);
	}

	update(delta: number) {
		this.deltaTotal += delta;
		this.collisionHandler();
		this.serverCorrection();
		this.sweetCorrectionMovement(delta);
		if (!this.sweetCorrectionType)
			this.manageMovement(delta);
		// this.hitBorders();
		// console.log(this.localBallState);

		this.x = toPx(this.localBallState.pos.x, this.appRef.screen.width);
		this.y = toPx(this.localBallState.pos.y, this.appRef.screen.height);
		this.angle = this.deltaTotal * 15 * this.localBallState.directionVector.x;
		if(this.rainbowingBall(delta))
			this.draw();
	}

	resize() {
		this.x = toPx(this.localBallState.pos.x, this.appRef.screen.width);
		this.y = toPx(this.localBallState.pos.y, this.appRef.screen.height);
		this.ballSize = this.appRef.screen.height / 50;
		if (this.ballSize > ballShapeStuff.width)
			this.ballSize = ballShapeStuff.width;
		this.draw();
	}

	draw() {
		this.ballShape.clear();
		this.ballShape.beginFill(this.ballColor);
		this.ballShape.drawRect(0, 0, ballShapeStuff.thickness, 
			this.ballSize);
		this.ballShape.drawRect(this.ballSize, 0, ballShapeStuff.thickness, 
			this.ballSize);
		this.ballShape.drawRect(0, 0, this.ballSize, ballShapeStuff.thickness);
		this.ballShape.drawRect(0, this.ballSize, this.ballSize + ballShapeStuff.thickness, ballShapeStuff.thickness);

		this.ballShape.endFill();
		this.scale.set(this.scaleFactor);
		this.pivot.set(this.width / 2 / this.scaleFactor, this.height / 2 / this.scaleFactor);
	}

	protected manageMovement(delta: number) {
		this.localBallState.pos.x += this.localBallState.directionVector.x * (this.localBallState.speedPPS / this.appRef.ticker.FPS) * delta;
		this.localBallState.pos.y += this.localBallState.directionVector.y * (this.localBallState.speedPPS / this.appRef.ticker.FPS) * delta;
		if (this.localBallState.pos.y < 0) {
			this.localBallState.pos.y *= -1;
			this.localBallState.directionVector.y *= -1;
		} else if (this.localBallState.pos.y > 100) {
			this.localBallState.pos.y = 100 - (this.localBallState.pos.y - 100);
			this.localBallState.directionVector.y *= -1;
		}
		if (this.localBallState.pos.x < 0) {
			this.localBallState.pos.x *= -1;
			this.localBallState.directionVector.x *= -1;
		} else if (this.localBallState.pos.x > 100) {
			this.localBallState.pos.x = 100 - (this.localBallState.pos.x - 100);
			this.localBallState.directionVector.x *= -1;
		}
	}

	protected serverCorrection() {
		// angle after collision correction
		if (this.oldServerDirectionVector.y && this.oldServerDirectionVector.y !== (this.appRef.gciMaster.currentResponseState as ResponseState).ballState.directionVector.y) {
			this.oldServerDirectionVector.x = 0;
			this.oldServerDirectionVector.y = 0;
			this.sweetCorrectionType = true;
			return ;
		}
		// position correction (10% ease range)
		if (this.oldServerPosVector.x !== (this.appRef.gciMaster.currentResponseState as ResponseState).ballState.pos.x) {
			this.oldServerPosVector.x = (this.appRef.gciMaster.currentResponseState as ResponseState).ballState.pos.x;
			this.oldServerPosVector.y = (this.appRef.gciMaster.currentResponseState as ResponseState).ballState.pos.y;
			let posDifferentialY : number = (this.appRef.gciMaster.currentResponseState as ResponseState).ballState.pos.y - this.localBallState.pos.y;
			let posDifferentialX : number = (this.appRef.gciMaster.currentResponseState as ResponseState).ballState.pos.x - this.localBallState.pos.x;
			if ((posDifferentialY > 5 || posDifferentialY < -5) || (posDifferentialX > 5 || posDifferentialX < -5)) {
				this.sweetCorrectionType = true;
				return ;
			}
		}
	}

	protected sweetCorrectionMovement(delta: number) {
		// let serverForwards : boolean = 
		// 	this.localBallState.directionVector.x < 0 ?
		// 	(this.appRef.gciMaster.currentResponseState as ResponseState).ballState.pos.x < this.localBallState.pos.x :
		// 	(this.appRef.gciMaster.currentResponseState as ResponseState).ballState.pos.x > this.localBallState.pos.x;
		// sweet angle correction
		if (this.sweetCorrectionType) {
			let correctionDirectionVector : Point = new Point(
				(this.appRef.gciMaster.currentResponseState as ResponseState).ballState.pos.x -
				this.localBallState.pos.x,
				(this.appRef.gciMaster.currentResponseState as ResponseState).ballState.pos.y -
				this.localBallState.pos.y
			).normalize();

			if (isNaN(correctionDirectionVector.x))
				correctionDirectionVector.x = 0;
			if (isNaN(correctionDirectionVector.y))
				correctionDirectionVector.y = 0;
			this.localBallState.pos.x += correctionDirectionVector.x * (this.localBallState.speedPPS * 1.5 / this.appRef.ticker.FPS) * delta;
			this.localBallState.pos.y += correctionDirectionVector.y * (this.localBallState.speedPPS * 1.5 / this.appRef.ticker.FPS) * delta;
	
			// console.log(`angle sweetener ${correctionDirectionVector.x} ${this.localBallState.pos.x} ${(this.appRef.gciMaster.currentResponseState as ResponseState).ballState.pos.x}`);
			if ((this.localBallState.directionVector.x > 0 && this.localBallState.pos.x >= (this.appRef.gciMaster.currentResponseState as ResponseState).ballState.pos.x) ||
			(this.localBallState.directionVector.x < 0 && this.localBallState.pos.x <= (this.appRef.gciMaster.currentResponseState as ResponseState).ballState.pos.x)) {
				this.sweetCorrectionType = false;
				this.localBallState.directionVector.x = (this.appRef.gciMaster.currentResponseState as ResponseState).ballState.directionVector.x;
				this.localBallState.directionVector.y = (this.appRef.gciMaster.currentResponseState as ResponseState).ballState.directionVector.y;
			}
		}
	}

	protected collisionHandler() {
		if (this.lastCollision && this.deltaTotal - this.lastCollision > 30)
			this.lastCollision = 0;
		if (!this.lastCollision && this.localBallState.pos.x < 15) {
			if (checkCollision(this.rackets[0], this)) {
				this.oldServerDirectionVector.x = this.localBallState.directionVector.x;
				this.oldServerDirectionVector.y = this.localBallState.directionVector.y;
				this.localBallState.directionVector.x *= -1;
				this.localBallState.directionVector.y = 0;
				this.lastCollision = this.deltaTotal;
				if (this.appRef.playerRacket === this.rackets[0].unit) {
					this.appRef.gciMaster.lastLocalGameActionComputed++;
					this.appRef.gciMaster.computedGameActions[this.appRef.gciMaster.lastLocalGameActionComputed] = {
						id: this.appRef.gciMaster.lastLocalGameActionComputed,
						keyPressed: GA_KEY.NONE,
						data: {
							y: toPer(this.rackets[0].absolutePosition.y, this.appRef.screen.height),
							ballPos: {
								x: this.localBallState.pos.x,
								y: this.localBallState.pos.y
							}
						}
					};
				}
			}
		}
		// else if (!this.lastCollision && this.localBallState.pos.x > 75) {
		// 	if (checkCollision(this.rackets[1], this)) {
		// 		this.oldServerDirectionVector.x = this.localBallState.directionVector.x;
		// 		this.oldServerDirectionVector.y = this.localBallState.directionVector.y;
		// 		this.localBallState.directionVector.x *= -1;
		// 		this.localBallState.directionVector.y = 0;
		// 		this.lastCollision = this.deltaTotal;
		// 		if (this.appRef.playerRacket === this.rackets[1].unit) {
		// 			this.appRef.gciMaster.lastLocalGameActionComputed++;
		// 			this.appRef.gciMaster.computedGameActions[this.appRef.gciMaster.lastLocalGameActionComputed] = {
		// 				id: this.appRef.gciMaster.lastLocalGameActionComputed,
		// 				keyPressed: GA_KEY.NONE,
		// 				data: {
		// 					y: toPer(this.rackets[1].absolutePosition.y, this.appRef.screen.height),
		// 					ballPos: {
		// 						x: this.localBallState.pos.x,
		// 						y: this.localBallState.pos.y
		// 					}
		// 				}
		// 			};
		// 		}
		// 	}
		// }
	}

	protected rainbowingBall(delta: number) : boolean {
		const colorFactor : number = 1000;

		if (this.localBallState.flags.rainbow) { //(this.selectCorrectUnit() as PlayerState).flags.rainbowing) {
			this.ballColor -= this.ballColor - colorFactor * delta < 0 ? 0xFFFFFF : colorFactor * delta;
			return (true);
		}
		if (!this.localBallState.flags.rainbow && this.ballColor !== 0xFFFFFF) {
			this.ballColor = 0xFFFFFF;
			return (true);
		}
		return (false);
	}
}

function checkCollision(objA: Racket, objB: DisplayObject): boolean {
    const a = objA.getBounds();
    const b = objB.getBounds();


    const rightmostLeft = a.left < b.left ? b.left : a.left;
    const leftmostRight = a.right > b.right ? b.right : a.right;

    if (leftmostRight <= rightmostLeft)
        return (false);

    const bottommostTop = a.top < b.top ? b.top : a.top;
    const topmostBottom = a.bottom > b.bottom ? b.bottom : a.bottom;

    return topmostBottom > bottommostTop;
}

export { Ball };