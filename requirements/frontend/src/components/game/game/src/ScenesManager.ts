import { Tween, update as tweenUpdate } from "@tweenjs/tween.js";
import { GCI_STATE } from "../GameClientInstance";
import { RUNSTATE } from "../types/ResponseState";
import { GameScene } from "./game_scene/GameScene";
import { EndScene } from "./other_scenes/EndScene";
import { LoaderScene } from "./other_scenes/LoaderScene";
import { WaitingScene } from "./other_scenes/WaitingScene";
import { TranscendanceApp } from "./TranscendanceApp";

const sceneType : Array<
	typeof WaitingScene | typeof GameScene | typeof EndScene
> = [ WaitingScene, GameScene, WaitingScene, EndScene ];

class ScenesManager {
	private appRef : TranscendanceApp;
	private currentScene : LoaderScene | WaitingScene | GameScene | EndScene | undefined = undefined;
	private newScene : LoaderScene | WaitingScene | GameScene | EndScene | undefined = undefined;
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
				this.currentScene?.destroy();
				this.appRef.stage.removeAllListeners();
				this.appRef.stage.removeChildren();
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
					})
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
			console.log(this.appRef.gciMaster.currentResponseState.runState);
			if (this.appRef.gciMaster.currentResponseState.runState === RUNSTATE.ENDED)
				this.appRef.gciMaster.gciState = GCI_STATE.ENDED;
			else {
				this.currentState = this.appRef.gciMaster.currentResponseState.runState;
				this.newScene = new sceneType[this.currentState](this.appRef);
				this.transitionSceneAnimation.start(this.deltaTotal);
			}
		}
		tweenUpdate(this.deltaTotal);
	}

	public destroy() {
		this.transitionSceneAnimation.end();
		this.appRef.ticker.remove(this.update, this);
	}
}

export { ScenesManager };