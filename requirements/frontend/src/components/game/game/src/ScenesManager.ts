import { Tween, update as tweenUpdate } from "@tweenjs/tween.js";
import { GCI_STATE } from "../GameClientInstance";
import { IScene } from "../types/IScene";
import { RUNSTATE } from "../types/ResponseState";
import { GameScene } from "./game_scene/GameScene";
import { EndScene } from "./other_scenes/EndScene";
import { LoaderScene } from "./other_scenes/LoaderScene";
import { TranscendanceApp } from "./TranscendanceApp";

const sceneType : Array<
	typeof LoaderScene | typeof GameScene | typeof EndScene
> = [ LoaderScene, LoaderScene, GameScene, LoaderScene, EndScene ];

class ScenesManager {
	private appRef : TranscendanceApp;
	private currentScene : IScene | undefined = undefined;
	private newScene : IScene | undefined = undefined;
	private transitionSceneAnimation : Tween<{ opacity: number }>;
	private deltaTotal : number = 0;
	private currentState : RUNSTATE | undefined = undefined;
	constructor(appRef : TranscendanceApp) {
		this.appRef = appRef;

		this.transitionSceneAnimation = new Tween({ opacity: 1 })
			.to({ opacity: 0 }, 20)
			.onUpdate((object) => {
				if (this.currentScene)
					this.currentScene.alpha = object.opacity
			} )
			.onComplete(() => {
				this.appRef.stage.removeAllListeners();
				this.appRef.stage.removeChildren();
				this.currentScene?.destroyScene();
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

		this.appRef.ticker.add(this.update, this);
		this.currentScene = new LoaderScene(this.appRef);
		this.appRef.stage.addChild(this.currentScene);
	}

	update(delta: number) {
		this.deltaTotal += delta;
		if (this.appRef.gciMaster.gciState === GCI_STATE.RUNNING &&
			this.appRef.gciMaster.currentResponseState &&
			this.appRef.gciMaster.currentResponseState.runState !== this.currentState)
		{
			this.currentState = this.appRef.gciMaster.currentResponseState.runState;
			this.newScene = new sceneType[this.currentState](this.appRef);
			this.transitionSceneAnimation.start(this.deltaTotal);
		}
		tweenUpdate(delta, true);
	}
}

export { ScenesManager };