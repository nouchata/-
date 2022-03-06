import { Container, Text } from "pixi.js";
import { IContainerElement } from "../../../types/IScene";
import { PlayerState } from "../../../types/PlayerState";
import { TranscendanceApp } from "../../TranscendanceApp";
import { Racket, RacketUnit } from "../racket/Racket";
import { update as tweenUpdate, Tween, Easing } from "@tweenjs/tween.js";
import { GameScene } from "../GameScene";

const playerCapacityColor: Array<number> = [0xFFFFFF, 0xFF0000, 0x00FF00, 0x0000FF];

class PlayerScoreGUI extends Container implements IContainerElement {
    private appRef : TranscendanceApp;
    private associatedRacket : Racket;
	private parentContainer : GameScene;
	private deltaTotal : number = 0;

	private rollingTween : Tween<{ yPos: number }>;

    private scoreDisplays : Array<Text> = [];
	private yPos : number = 50;

    private lastScore : number = 0;

    constructor(appRef : TranscendanceApp, parentContainer: GameScene, associatedRacket : Racket) {
        super();
        this.appRef = appRef;
        this.associatedRacket = associatedRacket;
		this.parentContainer = parentContainer;

        this.lastScore = (this.associatedRacket.selectCorrectUnit() as PlayerState).score;
		for (let i = 0 ; i < 2 ; i++) {
			this.scoreDisplays[i] = new Text(String(this.lastScore + i), {
				fontFamily: "Press Start 2P",
				fill: 0xFFFFFF
			});
			this.scoreDisplays[i].resolution = window.devicePixelRatio;
		}

		this.rollingTween = new Tween({ yPos: 50 })
			.to({ yPos: 150 }, 100)
			.easing(Easing.Back.Out)
			.onUpdate((object) => {
				this.yPos = object.yPos;
				this.scoreDisplays[0].y = (this.appRef.screen.height / 100) * this.yPos;
				this.scoreDisplays[1].y = (this.appRef.screen.height / 100) * (this.yPos - 100);
			})
			.onComplete(() => {
				this.yPos = 50;
				let tmpText : Text = this.scoreDisplays[1];
				this.scoreDisplays[1] = this.scoreDisplays[0];
				this.scoreDisplays[0] = tmpText;
			});

        this.resize();

        window.addEventListener("resizeGame", this.resize as EventListenerOrEventListenerObject);
        this.appRef.ticker.add(this.update, this);

        this.addChild(this.scoreDisplays[0]);
		this.addChild(this.scoreDisplays[1]);
        this.alpha = 0.05;
    }

    public update(delta: number) {
		this.deltaTotal += delta;
		// update score
		if ((this.associatedRacket.selectCorrectUnit() as PlayerState).score !== this.lastScore) {
			this.lastScore = (this.associatedRacket.selectCorrectUnit() as PlayerState).score;
			this.scoreDisplays[1].text = String(this.lastScore);
			this.rollingTween.start(this.deltaTotal);
			this.parentContainer.newScore = true;
		}

		tweenUpdate(delta, true);
    }

	resize : Function = (function(this: PlayerScoreGUI) {
		for (let i = 0 ; i < 2 ; i++) {
			this.scoreDisplays[i].style.fontSize = this.appRef.screen.height / 2;
			this.scoreDisplays[i].dirty = true;
			this.scoreDisplays[i].updateText(true);
			this.scoreDisplays[i].anchor.set(0.5);
			if (this.associatedRacket.unit === RacketUnit.LEFT)
				this.scoreDisplays[i].x = this.appRef.screen.width / 4;
			else
				this.scoreDisplays[i].x = (this.appRef.screen.width / 4) * 3;
			this.scoreDisplays[i].y = (this.appRef.screen.height / 100) * (i ? this.yPos - 100 : this.yPos);
		}
	}).bind(this);

    public destroy() {
		this.appRef.ticker.remove(this.update, this);
		window.removeEventListener("resizeGame", this.resize as EventListenerOrEventListenerObject);
        this.scoreDisplays[0].destroy();
		this.scoreDisplays[1].destroy();
		super.destroy();
	}
}

export default PlayerScoreGUI;