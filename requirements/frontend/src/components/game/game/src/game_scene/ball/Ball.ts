import { Container, DisplayObject, Graphics, Point, Rectangle } from "pixi.js";
import { BallFlags, BallState } from "../../../types/BallState";
import { ResponseState } from "../../../types/ResponseState";
import { TranscendanceApp } from "../../TranscendanceApp";
import { Racket, RacketUnit, toPer, toPx } from "../racket/Racket";
import { sound } from "@pixi/sound";
import "@pixi/math-extras";
import { GA_KEY } from "../../../types/GameAction";
import { GameComponents } from "../GameComponents";
import { IContainerElement } from "../../../types/IScene";
import { cloneDeep } from "lodash";
import { PLAYER_CAPACITY } from "../../../types/PlayerState";

const ballShapeStuff : {
	width: number,
	thickness: number 
} = {
	width: 10,
	thickness: 3
}

class Ball extends Container implements IContainerElement {
	protected appRef : TranscendanceApp;
	protected parentContainer : Container;

	protected ballShape : Graphics;
	protected ballColor : number = 0xFFFFFF;
	protected ballSize : number = ballShapeStuff.width;

	protected deltaTotal : number = 0;
	protected lastCollision : number = 0;

	protected scaleFactor : number = 1;

	protected oldServerDirectionVector : { x: number, y: number } = { x: 0, y: 0 };
	protected oldServerPosVector : { x: number, y: number } = { x: 0, y: 0 };

	protected sweetCorrectionType : boolean = false;

	public localBallState : BallState = {
		/* in percentage */
		pos: { x: 50, y: 50 },
		directionVector: { x: 1, y: 0.5 },
		speedPPS: 50,
		flags: {
			rainbow: false,
			smash: false,
			freezed: true,
			showed: false
		}
	};
	protected serverLastBallFlags : BallFlags = {
		rainbow: false,
		smash: false,
		freezed: false,
		showed: false
	};
	protected falseBallFlags : BallFlags | undefined = undefined;


	constructor(appRef : TranscendanceApp, parentContainer : Container) {
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

		this.parentContainer = parentContainer;

		window.addEventListener("resizeGame", this.resize as EventListenerOrEventListenerObject);
		this.appRef.ticker.add(this.update, this);
	}

	update(delta: number) {
		this.deltaTotal += delta;
		this.getServerFlags();
		if (this.localBallState.flags.freezed) {
			this.angle = 0;
			this.sweetCorrectionMovement(delta);
		} else {
			this.collisionHandler();
			this.serverCorrection();
			if (this.sweetCorrectionType)
				this.sweetCorrectionMovement(delta);
			else
				this.manageMovement(delta);
			this.angle = this.deltaTotal * 15 * this.localBallState.directionVector.x;
		}

		/* regarding the responsiveness it would be nice if the field of the ball wasn't the whole canvas
		 * but rather the space between the two rackets */
		this.x = toPx(this.localBallState.pos.x, this.appRef.screen.width);
		this.y = toPx(this.localBallState.pos.y, this.appRef.screen.height);

		if(this.rainbowingBall(delta))
			this.draw();
	}

	resize : Function = (function(this: Ball) {
		this.x = toPx(this.localBallState.pos.x, this.appRef.screen.width);
		this.y = toPx(this.localBallState.pos.y, this.appRef.screen.height);
		this.ballSize = this.appRef.screen.height / 50;
		if (this.ballSize > ballShapeStuff.width)
			this.ballSize = ballShapeStuff.width;
		this.draw();
	}).bind(this);

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
		const ballSpeed : number = this.localBallState.speedPPS * (this.localBallState.flags.smash ? 2 : 1);
		this.localBallState.pos.x += this.localBallState.directionVector.x * (ballSpeed / this.appRef.ticker.FPS) * delta;
		this.localBallState.pos.y += this.localBallState.directionVector.y * (ballSpeed / this.appRef.ticker.FPS) * delta;
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
			(this.parentContainer as GameComponents).shakeState = "left";
		} else if (this.localBallState.pos.x > 100) {
			this.localBallState.pos.x = 100 - (this.localBallState.pos.x - 100);
			this.localBallState.directionVector.x *= -1;
			(this.parentContainer as GameComponents).shakeState = "right";
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
		// position correction (5% ease range)
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
		const ballSpeed : number = this.localBallState.speedPPS * (this.localBallState.flags.smash ? 2 : 1);
		/* le facteur de vitesse doit être proportionnel à la distance qu'il reste à parcourir */
		this.localBallState.pos.x += correctionDirectionVector.x * (ballSpeed * 2 / this.appRef.ticker.FPS) * delta;
		this.localBallState.pos.y += correctionDirectionVector.y * (ballSpeed * 2 / this.appRef.ticker.FPS) * delta;

		if (this.localBallState.pos.x < -10 || this.localBallState.pos.x > 110) {
			this.localBallState.pos.x = (this.appRef.gciMaster.currentResponseState as ResponseState).ballState.pos.x;
			this.localBallState.pos.y = (this.appRef.gciMaster.currentResponseState as ResponseState).ballState.pos.y;
		}
		if ((this.localBallState.directionVector.x > 0 && this.localBallState.pos.x >= (this.appRef.gciMaster.currentResponseState as ResponseState).ballState.pos.x) ||
		(this.localBallState.directionVector.x < 0 && this.localBallState.pos.x <= (this.appRef.gciMaster.currentResponseState as ResponseState).ballState.pos.x)) {
			this.sweetCorrectionType = false;
			this.localBallState.directionVector.x = (this.appRef.gciMaster.currentResponseState as ResponseState).ballState.directionVector.x;
			this.localBallState.directionVector.y = (this.appRef.gciMaster.currentResponseState as ResponseState).ballState.directionVector.y;
		}
	}

	protected collisionHandler() {
		let currentRacket : Racket | undefined = undefined;
		if (this.lastCollision && this.deltaTotal - this.lastCollision > 10)
			this.lastCollision = 0;
		if (this.localBallState.pos.x < 25)
			currentRacket = (this.parentContainer as GameComponents).leftRacket;
		if (this.localBallState.pos.x > 75)
			currentRacket = (this.parentContainer as GameComponents).rightRacket;
		
		if (!this.lastCollision && currentRacket && currentRacket.canCollide) {
			if (this.checkCollision(currentRacket, this)) {
				this.oldServerDirectionVector.x = this.localBallState.directionVector.x;
				this.oldServerDirectionVector.y = this.localBallState.directionVector.y;
				this.localBallState.directionVector.x *= -1;
				this.lastCollision = this.deltaTotal;
		
				let racketPosPer: number = toPer(currentRacket.absolutePosition.y, this.appRef.screen.height);
				let topOfRacket: number = racketPosPer - (100 / (this.appRef.gciMaster.currentResponseState as ResponseState).gameOptions.racketSize / 2);
				let ballPercentageRacket: number = Math.floor((this.localBallState.pos.y - topOfRacket) / ((100 / (this.appRef.gciMaster.currentResponseState as ResponseState).gameOptions.racketSize) / 100));
				if (ballPercentageRacket < 10)
					ballPercentageRacket = 10;
				if (ballPercentageRacket > 90)
					ballPercentageRacket = 90;
				let newAngle: number = -10;
				for (let step = 10; !(ballPercentageRacket >= step && ballPercentageRacket <= step + 9) && newAngle < 6; step += 10)
					newAngle += 2;
				newAngle += 2;
				this.localBallState.directionVector.y = newAngle / 10;
				// remove racket sound if smash
				if (!(currentRacket.capacityLoader >= 98 &&
					(currentRacket.unit === RacketUnit.LEFT ? 
						(this.appRef.gciMaster.currentResponseState as ResponseState).playerOne.stockedCapacity === PLAYER_CAPACITY.SMASH :
						(this.appRef.gciMaster.currentResponseState as ResponseState).playerTwo.stockedCapacity === PLAYER_CAPACITY.SMASH
					)
				))
					sound.play("normalHit", { volume: 0.2 });
				// shaking after smash reception
				if (this.localBallState.flags.smash) {
					this.falseBallFlagsState({ showed: true, rainbow: false, smash: false, freezed: false });
					(this.parentContainer as GameComponents).shakeState = this.localBallState.pos.x < 50 ? "right" : "left";
				}
				if (this.appRef.playerRacket === currentRacket.unit) {
					this.appRef.gciMaster.lastLocalGameActionComputed++;
					this.appRef.gciMaster.computedGameActions[this.appRef.gciMaster.lastLocalGameActionComputed] = {
						id: this.appRef.gciMaster.lastLocalGameActionComputed,
						keyPressed: GA_KEY.NONE,
						data: {
							y: racketPosPer,
							ballPos: {
								x: this.localBallState.pos.x,
								y: this.localBallState.pos.y
							}
						}
					};
				}
			}
		}
	}

	protected rainbowingBall(delta: number) : boolean {
		const colorFactor : number = 1000;

		if (this.localBallState.flags.rainbow) {
			this.ballColor -= this.ballColor - colorFactor * delta < 0 ? 0xFFFFFF : colorFactor * delta;
			return (true);
		}
		if (!this.localBallState.flags.rainbow && this.ballColor !== 0xFFFFFF) {
			this.ballColor = 0xFFFFFF;
			return (true);
		}
		return (false);
	}

	protected checkCollision(objA: Racket, objB: DisplayObject): boolean {
		const a: Rectangle = objA.getCollisionShape();
		const b = objB.getBounds();

		const rightmostLeft = a.left < b.left ? b.left : a.left;
		const leftmostRight = a.right > b.right ? b.right : a.right;
	
		if (leftmostRight <= rightmostLeft)
			return (false);
	
		const bottommostTop = a.top < b.top ? b.top : a.top;
		const topmostBottom = a.bottom > b.bottom ? b.bottom : a.bottom;
	
		return topmostBottom > bottommostTop;
	}

	protected getServerFlags() {
		this.serverLastBallFlags = cloneDeep((this.appRef.gciMaster.currentResponseState as ResponseState).ballState.flags);
		this.falseBallFlagsState();
		this.localSmashHandler();
		if (!this.falseBallFlags)
			this.localBallState.flags = cloneDeep(this.serverLastBallFlags);
	}

	protected localSmashHandler() {
		if (!this.localBallState.flags.smash && this.serverLastBallFlags.smash &&
			!this.localBallState.flags.freezed && this.serverLastBallFlags.freezed) {
				sound.play("smashLoading");
				if (this.localBallState.pos.x < 50)
					(this.parentContainer as GameComponents).leftRacket.canCollide = false;
				else
					(this.parentContainer as GameComponents).rightRacket.canCollide = false;
		}
		if (this.localBallState.flags.smash && this.localBallState.flags.freezed &&
			!this.serverLastBallFlags.freezed) {
				sound.play("smashFire");
				(this.parentContainer as GameComponents).shakeState = this.localBallState.pos.x < 50 ? "left" : "right";
				if (this.localBallState.pos.x < 50)
					(this.parentContainer as GameComponents).leftRacket.cancelCharging = true;
				else
					(this.parentContainer as GameComponents).rightRacket.cancelCharging = true;
				setTimeout(() => {
					if (this.localBallState.pos.x < 50)
						(this.parentContainer as GameComponents).leftRacket.canCollide = true;
					else
						(this.parentContainer as GameComponents).rightRacket.canCollide = true;
				}, 50);
		}
		if (this.serverLastBallFlags.smash && this.scaleFactor === 1) {
			this.scaleFactor = 2;
			this.draw();
		}
		if ((!this.serverLastBallFlags.smash || (this.falseBallFlags && !this.falseBallFlags.smash)) &&
		this.scaleFactor === 2) {
			this.scaleFactor = 1;
			this.draw();
		}

	}

	protected falseBallFlagsState(setupValues?: BallFlags) {
		if (setupValues) {
			this.falseBallFlags = cloneDeep(this.serverLastBallFlags);
			this.localBallState.flags = cloneDeep(setupValues);
			return ;
		}
		if (!this.falseBallFlags || (
			this.falseBallFlags.freezed === this.serverLastBallFlags.freezed &&
			this.falseBallFlags.rainbow === this.serverLastBallFlags.rainbow &&
			this.falseBallFlags.showed === this.serverLastBallFlags.showed &&
			this.falseBallFlags.smash === this.serverLastBallFlags.smash
		))
			return ;
		this.falseBallFlags = undefined;
	}

	public resetData() {
		this.scaleFactor = 1;
		this.falseBallFlags = undefined;
		this.localBallState = cloneDeep((this.appRef.gciMaster.currentResponseState as ResponseState).ballState);
		this.serverLastBallFlags = cloneDeep((this.appRef.gciMaster.currentResponseState as ResponseState).ballState.flags);
		this.draw();
	}

	public destroyContainerElem() {
		this.ballShape.destroy();
		window.removeEventListener("resizeGame", this.resize as EventListenerOrEventListenerObject);
		this.destroy();
	}
}

export { Ball };