import { Easing, Tween, update as tweenUpdate } from "@tweenjs/tween.js";
import { GCI_STATE } from "../GameClientInstance";
import { IScene } from "../types/IScene";
import { RUNSTATE } from "../types/ResponseState";
import { GameComponents } from "./game_scene/GameComponents";
import { GameScene } from "./game_scene/GameScene";
import { LoaderScene } from "./loader_scene/LoaderScene";
import { TranscendanceApp } from "./TranscendanceApp";

class ScenesManager {
	private appRef : TranscendanceApp;
	private currentScene : IScene | undefined = undefined;
	private newScene : IScene | undefined = undefined;
	private transitionSceneAnimation : Tween<{ opacity: number }>;
	private deltaTotal : number = 0;
	constructor(appRef : TranscendanceApp) {
		this.appRef = appRef;

		this.transitionSceneAnimation = new Tween({ opacity: 1 })
			.to({ opacity: 0 }, 20)
			.onUpdate((object) => {
				if (this.currentScene)
					this.currentScene.alpha = object.opacity
			} )
			.onComplete(() => {
				this.appRef.stage.removeChildren();
				if (this.currentScene)
						this.currentScene.destroyScene();
				this.currentScene = this.newScene;
				if (this.currentScene) {
					this.currentScene.alpha = 0;
					this.appRef.stage.addChild(this.currentScene);
				}
			} )
			.chain(
				new Tween({ opacity: 0 })
					.to({ opacity: 1 }, 20)
					.onUpdate((object) => {
						if (this.currentScene)
							this.currentScene.alpha = object.opacity
					} )
			);

		this.currentScene = new LoaderScene(this.appRef);
		this.appRef.ticker.add(this.update, this);
		this.appRef.stage.addChild(this.currentScene);
	}

	async masterManagerLoop() {
		while (true) {
			this.updateScene();
			await new Promise((resolve) => setTimeout(() => resolve(1), 100));
			break ;
		}
	}

	update(delta: number) {
		this.deltaTotal += delta;
		tweenUpdate(this.deltaTotal);
	}

	private updateScene() {
		this.newScene = new GameComponents(this.appRef);
		this.transitionSceneAnimation.start(this.deltaTotal);
		// this.appRef.stage.removeChildren();
		// if (this.currentScene instanceof LoaderScene)
		// 		this.currentScene.destroyScene();
		// this.currentScene = new GameComponents(this.appRef);
		// this.currentScene.alpha = 0;
		// this.appRef.stage.addChild(this.currentScene);
		// this.transitionSceneAnimation[0].start(this.deltaTotal);
		// let sceneType : Array<Object> = [ LoaderScene ];
		// for (let scene)
		// if (this.appRef.gciMaster.currentResponseState?.runState === RUNSTATE.RUNNING && !(this.currentScene instanceof GameScene)) {
		// 	if (this.currentScene)
		// 		this.currentScene.destroyScene();
		// 	this.currentScene = new 
		// }
	}
}

export { ScenesManager };