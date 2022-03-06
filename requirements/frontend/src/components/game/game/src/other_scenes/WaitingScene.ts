import { Container, Filter, Rectangle, Text } from "pixi.js";
import { TranscendanceApp } from "../TranscendanceApp";
import { IScene } from "../../types/IScene";
import { AdvancedBloomFilter } from "@pixi/filter-advanced-bloom";
import { GCI_STATE } from "../../GameClientInstance";
import { update as tweenUpdate, Tween, Easing } from "@tweenjs/tween.js";
import { RUNSTATE } from "../../types/ResponseState";

class WaitingScene extends Container implements IScene {
	private appRef : TranscendanceApp;
	private aliases : Array<Text> = [];
	private status : Text;
	private statusStatus : "waiting" | "connected" | "error" = "waiting";
	private statusStrings : Array<string> = [];
	private bloomFilter : AdvancedBloomFilter;
	private deltaTotal : number = 0;
	private tweenText : Array< Tween<{ blur: number }> > = [];
	constructor(appRef : TranscendanceApp) {
		super();

		this.appRef = appRef;
		this.bloomFilter = new AdvancedBloomFilter({ blur: 3 });

		if (this.appRef.gciMaster.currentResponseState?.runState === RUNSTATE.WAITING) {
			this.statusStrings[0] = "Waiting for both players to be connected ...";
			this.statusStrings[1] = "The game is about to start ...";
			this.statusStrings[2] = "Instance closed because players weren't connected at time.";
		} else {
			this.statusStrings[0] = "Waiting for disconnected player to reconnect ...";
			this.statusStrings[1] = "The game is about to restart ...";
			this.statusStrings[2] = "Instance closed because because\nthe disconnected player didn't reconnect.";
		}

		for (let i = 0 ; i < 2 ; i++) {
			this.aliases[i] = new Text(this.appRef.gciMaster.playersAliases[i], {
				fontFamily: "Press Start 2P",
				fill: 0xFFFFFF,
				align: "center"
			});
			this.aliases[i].resolution = window.devicePixelRatio;
			this.aliases[i].anchor.set(0.5, i ? 1 : 0);
			this.aliases[i].filters = [new AdvancedBloomFilter({ blur: 0 })];

			this.tweenText[i] = new Tween({ blur: 3 })
				.to({ blur: 1.5 }, 50)
				.easing(Easing.Back.In)
				.onUpdate((object) => ((this.aliases[i].filters as Filter[])[0] as AdvancedBloomFilter).blur = object.blur)
				.onStop(() => ((this.aliases[i].filters as Filter[])[0] as AdvancedBloomFilter).blur = 0)
				.repeat(Infinity).yoyo(true);
		}
		this.status = new Text(this.statusStrings[0], {
			fontFamily: "Arial",
			fill: 0xFFFFFF,
			fontSize: 15,
			align: "center"
		});
		this.status.resolution = window.devicePixelRatio;
		this.status.anchor.set(0.5);

		this.resize();

		this.addChild(this.aliases[0]);
		this.addChild(this.aliases[1]);
		this.addChild(this.status);
		window.addEventListener("resizeGame", this.resize as EventListenerOrEventListenerObject);
		this.appRef.ticker.add(this.update, this);
	}

	resize : Function = (function(this: WaitingScene) {
		for (let i = 0 ; i < 2 ; i++) {
			this.aliases[i].style.fontSize = 64;
			this.aliases[i].dirty = true;
			this.aliases[i].filterArea = new Rectangle(0, 0, this.appRef.screen.width, this.appRef.screen.height);
			this.aliases[i].x = this.appRef.screen.width / 2;
			this.aliases[i].y = i ? this.appRef.screen.height - (this.appRef.screen.height / 100 * 5) : (this.appRef.screen.height / 100 * 5);
		}
		this.status.x = this.appRef.screen.width / 2;
		this.status.y = this.appRef.screen.height / 2;
	}).bind(this);

	update(delta: number) {
		this.deltaTotal += delta;
		if (this.appRef.gciMaster.currentResponseState?.playerOne.connected && !this.tweenText[0].isPlaying())
			this.tweenText[0].start(this.deltaTotal);
		if (this.appRef.gciMaster.currentResponseState?.playerTwo.connected && !this.tweenText[1].isPlaying())
			this.tweenText[1].start(this.deltaTotal);
		if (!this.appRef.gciMaster.currentResponseState?.playerOne.connected && this.tweenText[0].isPlaying())
			this.tweenText[0].stop();
		if (!this.appRef.gciMaster.currentResponseState?.playerTwo.connected && this.tweenText[1].isPlaying())
			this.tweenText[1].stop();
		
		this.statusTextHandler();
		tweenUpdate(this.deltaTotal);
	}

	statusTextHandler() {
		if (this.appRef.gciMaster.currentResponseState?.playerOne.connected && 
		this.appRef.gciMaster.currentResponseState?.playerTwo.connected &&
		this.statusStatus === "waiting") {
			this.statusStatus = "connected";
			this.status.text = this.statusStrings[1];
		}
		if ((!this.appRef.gciMaster.currentResponseState?.playerOne.connected || 
		!this.appRef.gciMaster.currentResponseState?.playerTwo.connected) &&
		this.statusStatus === "connected") {
			this.statusStatus = "waiting";
			this.status.text = this.statusStrings[0];
		}
		if (this.appRef.gciMaster.currentResponseState?.runState === RUNSTATE.ENDED) {
			this.statusStatus = "error";
			this.status.text = this.statusStrings[2];
		}
	}

	destroy() {
		this.appRef.ticker.remove(this.update, this);
		this.tweenText[0].end();
		this.tweenText[1].end();
		this.aliases[0].destroy();
		this.aliases[1].destroy();
		this.status.destroy();
		window.removeEventListener("resizeGame", this.resize as EventListenerOrEventListenerObject);
		super.destroy();
	}
}

export { WaitingScene };