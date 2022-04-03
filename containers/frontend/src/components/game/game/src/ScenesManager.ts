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
	private deltaTotal : number = 0;
	private currentState : RUNSTATE | undefined = undefined;
	constructor(appRef : TranscendanceApp) {
		this.appRef = appRef;

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
			if (this.appRef.gciMaster.currentResponseState.runState === RUNSTATE.ENDED)
				this.appRef.gciMaster.gciState = GCI_STATE.ENDED;
			else {
				this.currentState = this.appRef.gciMaster.currentResponseState.runState;
				this.newScene = new sceneType[this.currentState](this.appRef);
				this.currentScene?.destroy();
				this.appRef.stage.removeAllListeners();
				this.appRef.stage.removeChildren();
				this.currentScene = this.newScene;
				this.newScene = undefined;
				this.appRef.stage.addChild(this.currentScene);
			}
		}
	}

	public destroy() {
		this.appRef.ticker.remove(this.update, this);
		this.currentScene?.destroy();
		this.currentScene = undefined;
	}
}

export { ScenesManager };