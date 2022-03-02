import { Container } from "pixi.js";
import { IContainerElement } from "../../../types/IScene";
import { TranscendanceApp } from "../../TranscendanceApp";
import { GameComponents } from "../GameComponents";

class PlayerDataGUI extends Container implements IContainerElement {
    private appRef : TranscendanceApp;
    private gameComps : GameComponents;

    constructor(appRef : TranscendanceApp, gameComps : GameComponents) {
        super();
        this.appRef = appRef;
        this.gameComps = gameComps;

        window.addEventListener("resizeGame", this.resize as EventListenerOrEventListenerObject);
        this.appRef.ticker.add(this.update, this);
    }

    public update() {

    }

	resize : Function = (function(this: PlayerDataGUI) {
		// this.x = this.appRef.screen.width / 2;
		// this.y = this.appRef.screen.height / 2;
		// this.pivot.set(this.x, this.y);
	}).bind(this);

    public destroyContainerElem() {
		window.removeEventListener("resizeGame", this.resize as EventListenerOrEventListenerObject);
		this.destroy();
	}
}

export default PlayerDataGUI;