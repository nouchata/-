import { Container, Loader, Rectangle, Sprite, Text } from "pixi.js";
import { TranscendanceApp } from "../TranscendanceApp";
import { AdvancedBloomFilter } from "@pixi/filter-advanced-bloom";
import { Easing, Tween, update as tweenUpdate } from "@tweenjs/tween.js";

import Logo from "../../../../../assets/tempresize.png";
import { gameAssets } from "../_assets";

import { sound } from "@pixi/sound";
import { GCI_STATE } from "../../GameClientInstance";
import { RacketUnit } from "../game_scene/racket/Racket";
import { IScene } from "../../types/IScene";

class LoaderScene extends Container implements IScene {
	private appRef : TranscendanceApp;
	private logo : Sprite;
	private text : Text;
	private bloomFilter : AdvancedBloomFilter;
	private flickeringTween : Tween<{ blur: number }>;
	private deltaTotal : number = 0;
	private isLoaded : boolean = false;
	constructor(appRef : TranscendanceApp) {
		super();
		this.interactive = true;

		this.appRef = appRef;
		this.bloomFilter = new AdvancedBloomFilter({ blur: 0 });

		this.logo = Sprite.from(Logo);
		this.logo.filters = [this.bloomFilter];
		this.logo.filterArea = new Rectangle(0, 0, this.appRef.screen.width, this.appRef.screen.height);
		this.logo.anchor.set(.5, .5);

		this.text = new Text("Loading the assets ...", {
			fontFamily: "Helvetica",
			fontSize: 20,
			fill: 0xFFFFFF,
			align: "center"
		});
		this.text.resolution = window.devicePixelRatio;
		this.text.anchor.set(.5, .5);

		this.resize();

		this.flickeringTween = new Tween({ blur: 0 })
			.to({ blur: 3 }, 100)
			.easing(Easing.Elastic.InOut)
			.onStart(() => {
				sound.play("flickeringNeon", { volume: 0.5 });
			})
			.onUpdate((object) => this.bloomFilter.blur = object.blur)
			.chain(
				new Tween({ blur: 3 })
					.to({ blur: 1.5 }, 50)
					.easing(Easing.Back.In)
					.onUpdate((object) => this.bloomFilter.blur = object.blur)
					.repeat(Infinity).yoyo(true)
			);

		this.addChild(this.logo);
		this.addChild(this.text);
		window.addEventListener("resizeGame", this.resize as EventListenerOrEventListenerObject);
		this.appRef.ticker.add(this.update, this);

		Loader.shared.add(gameAssets);
		Loader.shared.onError.once(this.errorLoading, this);
		Loader.shared.onComplete.once(this.doneLoadingAssets, this);
		Loader.shared.load();
	}

	resize : Function = (function(this: LoaderScene) {
		this.logo.filterArea = new Rectangle(0, 0, this.appRef.screen.width, this.appRef.screen.height);

		this.logo.scale.set(this.appRef.screen.width < 800 || this.appRef.screen.height < 400 ? .5 : 1);
		this.text.scale.set(this.appRef.screen.width < 800 || this.appRef.screen.height < 400 ? .7 : 1);
			
		this.logo.x = this.appRef.screen.width / 2;
		this.logo.y = this.appRef.screen.height / 100 * 40;

		this.text.x = this.appRef.screen.width / 2;
		this.text.y = this.appRef.screen.height / 100 * 60;
	}).bind(this);

	update(delta: number) {
		this.deltaTotal += delta;
		tweenUpdate(this.deltaTotal);
	}

	async doneLoadingAssets() {
		this.text.text = "Trying to reach the server ...";
		while (true) {
			if (this.appRef.gciMaster.gciState === GCI_STATE.WS_ERROR)
				return this.errorLoading();
			if (this.appRef.gciMaster.currentResponseState)
				break ;
			await new Promise((resolve) => setTimeout(() => resolve(1), 100));
		}

		this.text.text = "Click on the screen to continue";
		this.flickeringTween.start(0);
		this.isLoaded = true;
		this.once("pointertap", this.quitLoadingScreen, this);
	}

	errorLoading(error?: Error) {
		if (error)
			this.text.text = "Error while loading the assets: \n" + error.message;
		else if (this.appRef.gciMaster.wsError)
			this.text.text = "Error while reaching server :\n" + this.appRef.gciMaster.wsError;
		else
			this.text.text = "Error while loading";
	}

	quitLoadingScreen() {
		if (this.appRef.gciMaster.currentResponseState?.playerOne.id === this.appRef.userId)
			this.appRef.playerRacket = RacketUnit.LEFT;
		else if (this.appRef.gciMaster.currentResponseState?.playerTwo.id === this.appRef.userId)
			this.appRef.playerRacket = RacketUnit.RIGHT;
		this.appRef.gciMaster.gciState = GCI_STATE.RUNNING;
		this.appRef.manager.masterManagerLoop();
	}

	destroyScene() {
		this.logo.destroy();
		this.text.destroy();
		this.flickeringTween.stop();
		this.destroy();
		window.removeEventListener("resizeGame", this.resize as EventListenerOrEventListenerObject);
	}
}

export { LoaderScene };