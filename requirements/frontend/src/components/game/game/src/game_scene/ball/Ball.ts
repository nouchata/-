import { Container, Graphics } from "pixi.js";
import { BallState } from "../../../types/BallState";
import { ResponseState } from "../../../types/ResponseState";
import { TranscendanceApp } from "../../TranscendanceApp";
import { toPx } from "../racket/Racket";
import { Sound } from "@pixi/sound";

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
	protected scaleFactor : number = 1;
	protected headingRight : boolean = true;
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


	constructor(appRef : TranscendanceApp) {
		super();
		this.appRef = appRef;

		

		this.ballShape = new Graphics();

		this.addChild(this.ballShape);
		this.draw();
		// this.ballShape.pivot.set(this.ballShape.width / 2, this.ballShape.height / 2);

		// this.localBallState.pos.x = (this.appRef.gciMaster.currentResponseState as ResponseState).ballState.pos.x;
		// this.localBallState.pos.y = (this.appRef.gciMaster.currentResponseState as ResponseState).ballState.pos.y;

		// this.x = toPx(this.localBallState.pos.x, this.appRef.screen.width);
		// this.y = toPx(this.localBallState.pos.y, this.appRef.screen.height);
		this.x = 20 + 10;
		this.y = this.appRef.screen.height / 2;

		window.addEventListener("resizeGame", this.resize.bind(this));
		this.appRef.ticker.add(this.update, this);
	}

	update(delta: number) {
		this.deltaTotal += delta;
		this.manageMovement(delta);
		this.hitBorders();

		this.x = toPx(this.localBallState.pos.x, this.appRef.screen.width);
		this.y = toPx(this.localBallState.pos.y, this.appRef.screen.height);
		this.angle = this.deltaTotal * 15 * this.localBallState.directionVector.x;
		// if(this.rainbowingBall(delta))
		// 	this.draw();
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
		// let directionVectorX = this.localBallState.headingRight ? this.localBallState.directionVector.x : -this.localBallState.directionVector.x;
		// let directionVectorY = this.localBallState.headingRight ? this.localBallState.directionVector.y : -this.localBallState.directionVector.y;
		this.localBallState.pos.x += this.localBallState.directionVector.x * (this.localBallState.speedPPS / 60) * delta;
		this.localBallState.pos.y += this.localBallState.directionVector.y * (this.localBallState.speedPPS / 60) * delta;
		// console.log(directionVectorX);
		// console.log(this.localBallState.pos.y);
		if (this.localBallState.pos.x < 0)
			this.localBallState.pos.x = 0;
		else if (this.localBallState.pos.x > 100)
			this.localBallState.pos.x = 100;
		if (this.localBallState.pos.y < 0)
			this.localBallState.pos.y = 0;
		else if (this.localBallState.pos.y > 100)
			this.localBallState.pos.y = 100;
	}

	protected hitBorders() {
		if (this.localBallState.pos.x === 0) {
			this.localBallState.directionVector.x *= -1;
			// this.localBallState.directionVector.y *= -1;
		}
		else if (this.localBallState.pos.x === 100) {
			this.localBallState.directionVector.x *= -1;
			// this.localBallState.directionVector.y *= -1;
		}
		if (this.localBallState.pos.y === 0) {
			this.localBallState.directionVector.y *= -1;
		}
		else if (this.localBallState.pos.y === 100) {
			this.localBallState.directionVector.y *= -1;
		}
	}

	protected rainbowingBall(delta: number) : boolean {
		const colorFactor : number = 1000;

		if (true) { //(this.selectCorrectUnit() as PlayerState).flags.rainbowing) {
			this.ballColor -= this.ballColor - colorFactor * delta < 0 ? 0xFFFFFF : colorFactor * delta;
			return (true);
		}
		// if (!(this.selectCorrectUnit() as PlayerState).flags.rainbowing && this.ballColor !== 0xFFFFFF) {
		// 	this.ballColor = 0xFFFFFF;
		// 	return (true);
		// }
		return (false);
	}

	protected getBallField() {

		return ({ x: 0, y: 0, width: 0, height: 0 });
	}
}

export { Ball };