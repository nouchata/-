import { Container, Graphics } from "pixi.js";
import { IContainerElement } from "../../../types/IScene";
import { PlayerState, PLAYER_CAPACITY } from "../../../types/PlayerState";
import { TranscendanceApp } from "../../TranscendanceApp";
import { GameComponents } from "../GameComponents";
import { Racket, RacketUnit } from "../racket/Racket";

const playerCapacityColor: Array<number> = [0xFFFFFF, 0xFF0000, 0x00FF00, 0x0000FF];

class PlayerDataGUI extends Container implements IContainerElement {
    private appRef : TranscendanceApp;
    private gameComps : GameComponents;
    private associatedRacket : Racket;

    private powerLoaderShape : Graphics = new Graphics();

    private lastPowerLoaderState : number = 0;
    private lastPower : PLAYER_CAPACITY = PLAYER_CAPACITY.NONE;
    private squareLength : number = 50;

    constructor(appRef : TranscendanceApp, gameComps : GameComponents, associatedRacket : Racket) {
        super();
        this.appRef = appRef;
        this.gameComps = gameComps;
        this.associatedRacket = associatedRacket;

        this.lastPowerLoaderState = (this.associatedRacket.selectCorrectUnit() as PlayerState).capacityUnlockerPercentage;
        this.lastPower = (this.associatedRacket.selectCorrectUnit() as PlayerState).stockedCapacity;

        this.resize();

        window.addEventListener("resizeGame", this.resize as EventListenerOrEventListenerObject);
        this.appRef.ticker.add(this.update, this);

        this.addChild(this.powerLoaderShape);
        this.alpha = 0.3;
        // this.addChild(this.scoreText);
    }

    public update(delta: number) {
        const currentCapacityUnlockerPercentage = (this.associatedRacket.selectCorrectUnit() as PlayerState).capacityUnlockerPercentage;
        const currentCapacity = (this.associatedRacket.selectCorrectUnit() as PlayerState).stockedCapacity;
        if (currentCapacity !== this.lastPower || currentCapacityUnlockerPercentage !== this.lastPowerLoaderState) {
            this.lastPower = currentCapacity;
            this.lastPowerLoaderState = currentCapacityUnlockerPercentage;
            this.powerLoaderDraw(3);
        }
    }

    private powerLoaderDraw(thickness: number) {
        const currentCapacityUnlockerPercentage = (this.associatedRacket.selectCorrectUnit() as PlayerState).capacityUnlockerPercentage;
        const currentCapacity = (this.associatedRacket.selectCorrectUnit() as PlayerState).stockedCapacity;
        const fullBars : number = Math.floor(currentCapacityUnlockerPercentage / 25);
        const percentagesLeft : number = currentCapacityUnlockerPercentage - (25 * fullBars);
        this.powerLoaderShape.clear();
        // loader background
        this.powerLoaderShape.beginFill(0xFFFFFF, 0.5);
        this.powerLoaderShape.drawRect(0, 0, this.squareLength, thickness);
        this.powerLoaderShape.drawRect(this.squareLength, 0, thickness, this.squareLength);
        this.powerLoaderShape.drawRect(thickness, this.squareLength, this.squareLength, thickness);
        this.powerLoaderShape.drawRect(0, thickness, thickness, this.squareLength);
        this.powerLoaderShape.endFill();
        // loader
        this.powerLoaderShape.beginFill(playerCapacityColor[currentCapacity as PLAYER_CAPACITY]);
        if (fullBars >= 1) {
            this.powerLoaderShape.drawRect(0, 0, this.squareLength, thickness);
            if (fullBars >= 2) {
                this.powerLoaderShape.drawRect(this.squareLength, 0, thickness, this.squareLength);
                if (fullBars >= 3) {
                    this.powerLoaderShape.drawRect(thickness + this.squareLength, this.squareLength, -(this.squareLength), thickness);
                    /* fourth bar drawing */
                    this.powerLoaderShape.drawRect(0, thickness + this.squareLength, thickness, -(this.squareLength / 100 * ((currentCapacityUnlockerPercentage - 75) * 4)));
                } else {
                    this.powerLoaderShape.drawRect(thickness + this.squareLength, this.squareLength, -(this.squareLength / 100 * (percentagesLeft * 4)), thickness);
                }
            } else {
                this.powerLoaderShape.drawRect(this.squareLength, 0, thickness, this.squareLength / 100 * (percentagesLeft * 4));
            }
        } else {
            this.powerLoaderShape.drawRect(0, 0, this.squareLength / 100 * (percentagesLeft * 4), thickness);
        }
        if (currentCapacity)
            this.powerLoaderShape.drawRect(thickness * 2, thickness * 2, this.squareLength - thickness * 3, this.squareLength - thickness * 3);
        this.powerLoaderShape.endFill();

    }

	resize : Function = (function(this: PlayerDataGUI) {
        this.squareLength = this.appRef.screen.width / 30;
        this.powerLoaderDraw(3);
        if (this.associatedRacket.unit === RacketUnit.LEFT) {
            this.powerLoaderShape.pivot.set(this.powerLoaderShape.width, 0);
            this.y = 3;
            this.x = this.appRef.screen.width / 2 - 5;
        }
        else {
            this.powerLoaderShape.pivot.set(0, this.powerLoaderShape.height);
            this.y = this.appRef.screen.height - 3;
            this.x = this.appRef.screen.width / 2 + 6;
        }
	}).bind(this);

    public destroyContainerElem() {
		window.removeEventListener("resizeGame", this.resize as EventListenerOrEventListenerObject);
		this.destroy();
	}
}

export default PlayerDataGUI;