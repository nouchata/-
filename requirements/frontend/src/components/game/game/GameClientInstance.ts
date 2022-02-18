/* eslint-disable */

import { AdvancedBloomFilter } from '@pixi/filter-advanced-bloom';
import { GlitchFilter } from '@pixi/filter-glitch';
import { AbstractRenderer, autoDetectRenderer, BaseRenderTexture, Container, Filter, Graphics, LINE_JOIN, Loader, PI_2, Rectangle, RenderTexture, Sprite, Text, Texture, UPDATE_PRIORITY } from 'pixi.js'
import { GameWS } from './GameWS';
import { Ball } from './src/game_scene/ball/Ball';
import { GameComponents } from './src/game_scene/GameComponents';
import { PlayerRacket } from './src/game_scene/racket/PlayerRacket';
import { Racket, RacketUnit } from './src/game_scene/racket/Racket';
import { SpectatorRacket } from './src/game_scene/racket/SpectatorRacket';
import { LoaderScene } from './src/loader_scene/LoaderScene';
import { TranscendanceApp } from './src/TranscendanceApp';
import { GameAction } from './types/GameAction';
import { ResponseState, RUNSTATE } from './types/ResponseState';
// import { PlayerRacket, RacketUnit } from './playerRacket';

enum GCI_STATE {
	SETUP,
	LOADED,
	RUNNING,
	ENDED,
	ERROR,
	WS_ERROR
};

class GameClientInstance {
	gciState: GCI_STATE = GCI_STATE.SETUP;
	app: TranscendanceApp;

	wsClient: GameWS;
	wsError: string | undefined;
	/* for the player of this instance if there is one */

	computedGameActions: { [actionId: number]: GameAction | undefined } = {};
	private lastCleanedCGAIndex: number = 0;

	lastLocalGameActionComputed: number = -1;
	lastlocalGameActionSended: number = -1;
	/* states */
	currentResponseState: ResponseState | undefined;
	// previousResponseState: ResponseState | undefined;
	currentServerTime: number = 0;
	private customResizeEvent: Event = new Event('resizeGame');

	private runState: RUNSTATE = RUNSTATE.WAITING;

	constructor(userId: number, instanceId: number) {
		this.wsClient = new GameWS(instanceId, this.onSocketStateUpdate.bind(this), this.onSocketError.bind(this));

		this.app = new TranscendanceApp(
			this,
			userId,
			{
				view: document.getElementById("game-canvas") as HTMLCanvasElement,
				resolution: 1,
				resizeTo: document.getElementsByClassName("game-display").item(0) as HTMLElement,
				autoDensity: true,
				// backgroundColor: 0x6495ed,
				backgroundColor: 0x000000,
				width: 500,
				height: 500
			}
		);

		// custom event to save calcul processing by debouncing the resizing event
		window.addEventListener("resize", ((customResizeEvent: Event) => {
			let flag : number = 0;
			return (function() {
				if (flag) {
					window.clearTimeout(flag);
					flag = 0;
				}
				flag = setTimeout(() => window.dispatchEvent(customResizeEvent), 100) as unknown as number;
			});
		})(this.customResizeEvent));

		window.addEventListener("keydown", this.onKeyDown.bind(this));
		window.addEventListener("keyup", this.onKeyUp.bind(this));

		this.app.ticker.add(this.actionSender, this);
	}

	destroy() {
		this.gciState = GCI_STATE.ENDED;
		this.app.destroy();
		this.wsClient.destroy();
	}

	onSocketStateUpdate(newState: ResponseState) {
		this.currentResponseState = newState;
		// cleaning for garbage collector
		if (this.app.playerRacket)
			this.computedGameActionsCleaner(
				this.app.playerRacket === RacketUnit.LEFT ?
				this.currentResponseState.playerOneLastActionProcessed :
				this.currentResponseState.playerTwoLastActionProcessed
			);
	}

	onSocketError(e: any) {
		this.gciState = GCI_STATE.WS_ERROR;
		this.wsError = e.message;
	}

	actionSender() {
		if (this.currentResponseState?.runState === RUNSTATE.RUNNING && this.app.playerRacket) {
			if (this.computedGameActions[this.lastlocalGameActionSended + 1]) {
				this.wsClient.emit(this.computedGameActions[this.lastlocalGameActionSended + 1] as GameAction);
				this.lastlocalGameActionSended++;
			}
		}
	}

	private onKeyDown(e: KeyboardEvent) {
		if (this.app.playerRacket) {
			if (e.key === "ArrowUp" || e.key === "ArrowDown" || e.key === " ") {
				e.preventDefault();
				e.stopPropagation();
			}
			if (e.key === "ArrowUp")
				this.app.actualKeysPressed.up = true;
			else if (e.key === "ArrowDown")
				this.app.actualKeysPressed.down = true;
			else if (e.key === " ")
				this.app.actualKeysPressed.space = true;
		}
	}

	private onKeyUp(e: KeyboardEvent) {
		if (this.app.playerRacket) {
			if (e.key === "ArrowUp" || e.key === "ArrowDown" || e.key === " ") {
				e.preventDefault();
				e.stopPropagation();
			}
			if (e.key === "ArrowUp")
				this.app.actualKeysPressed.up = false;
			else if (e.key === "ArrowDown")
				this.app.actualKeysPressed.down = false;
			else if (e.key === " ")
				this.app.actualKeysPressed.space = false;
		}
	}

	private async computedGameActionsCleaner(index: number) {
		let i: number = this.lastCleanedCGAIndex;
		this.lastCleanedCGAIndex = index;
		for (; i <= index ; i++)
			this.computedGameActions[i] = undefined;
	}
};

export { GameClientInstance, GCI_STATE };
