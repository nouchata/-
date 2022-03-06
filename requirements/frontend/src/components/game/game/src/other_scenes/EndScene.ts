import { Container, Rectangle, Text } from "pixi.js";
import { TranscendanceApp } from "../TranscendanceApp";
import { GodrayFilter } from "@pixi/filter-godray";
import { IScene } from "../../types/IScene";
import { AdvancedBloomFilter } from "@pixi/filter-advanced-bloom";
import { GCI_STATE } from "../../GameClientInstance";
import { update as tweenUpdate, Tween, Easing } from "@tweenjs/tween.js";

class EndScene extends Container implements IScene {
	private appRef : TranscendanceApp;
	private text : Text;
	private godrayFilter : GodrayFilter;
	private bloomFilter : AdvancedBloomFilter;
	private deltaTotal : number = 0;
	private tweenText : Tween<{ blur: number }>;
	constructor(appRef : TranscendanceApp) {
		super();

		this.appRef = appRef;
		this.appRef.gciMaster.gciState = GCI_STATE.ENDED;
		this.bloomFilter = new AdvancedBloomFilter({ blur: 3 });
		this.godrayFilter = new GodrayFilter();
		this.godrayFilter.resolution = window.devicePixelRatio;
		this.godrayFilter.alpha = 0.4;

		this.tweenText = new Tween({ blur: 3 })
			.to({ blur: 1.5 }, 50)
			.easing(Easing.Back.In)
			.onUpdate((object) => this.bloomFilter.blur = object.blur)
			.repeat(Infinity).yoyo(true);

		this.text = new Text(`${this.appRef.gciMaster.playersAliases[this.appRef.gciMaster.currentResponseState?.playerTwo.score === 6 ? 1 : 0]}\nwon!`, {
			fontFamily: "Press Start 2P",
			fill: 0xFFFFFF,
			align: "center"
		});
		this.text.resolution = window.devicePixelRatio;
		this.text.anchor.set(.5, .5);

		this.filters = [this.godrayFilter];
		this.text.filters = [this.bloomFilter];

		this.resize();

		this.addChild(this.text);
		window.addEventListener("resizeGame", this.resize as EventListenerOrEventListenerObject);
		this.appRef.ticker.add(this.update, this);

		this.tweenText.start(this.deltaTotal);
	}

	resize : Function = (function(this: EndScene) {
		this.text.style.fontSize = this.appRef.screen.height / 10;
		this.text.dirty = true;
		this.filterArea = new Rectangle(0, 0, this.appRef.screen.width, this.appRef.screen.height);
		this.text.filterArea = new Rectangle(0, 0, this.appRef.screen.width, this.appRef.screen.height);
		this.text.x = this.appRef.screen.width / 2;
		this.text.y = this.appRef.screen.height / 2;
	}).bind(this);

	update(delta: number) {
		this.deltaTotal += delta;
		this.godrayFilter.time += delta / 50;
		tweenUpdate(delta, true);
	}

	destroyScene() {
		this.text.destroy();
		this.destroy();
		window.removeEventListener("resizeGame", this.resize as EventListenerOrEventListenerObject);
	}
}

export { EndScene };