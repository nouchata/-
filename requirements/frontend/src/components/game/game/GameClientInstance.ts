/* eslint-disable */

import { AdvancedBloomFilter } from '@pixi/filter-advanced-bloom';
import { GlitchFilter } from '@pixi/filter-glitch';
import { Container, Filter, Graphics, LINE_JOIN, PI_2, Rectangle, Sprite, Text, UPDATE_PRIORITY } from 'pixi.js'
import { GameWS } from './GameWS';
import { PlayerRacket, PlayerRacketUnit } from './src/game_scene/PlayerRacket';
import { TranscendanceApp } from './src/TranscendanceApp';
import { GameAction } from './types/GameAction';
import { ResponseState, RUNSTATE } from './types/ResponseState';
// import { PlayerRacket, PlayerRacketUnit } from './playerRacket';

enum GCI_STATE {
	SETUP,
	RUNNING,
	ENDED,
	ERROR,
	WS_ERROR
};

class GameClientInstance {
	gciState: GCI_STATE = GCI_STATE.SETUP;
	app: TranscendanceApp;
	wsClient: GameWS;
	/* for the player of this instance if there is one */
	private canCompute: boolean = true;
	private computedGameActions: { [actionId: number]: GameAction | undefined } = {};
	private lastLocalGameActionComputed: number = -1;
	private lastlocalGameActionSended: number = -1;
	/* states */
	private currentResponseState: ResponseState | undefined;
	private previousResponseState: ResponseState | undefined;
	private currentServerTime: number = 0;

	private runState: RUNSTATE = RUNSTATE.WAITING;

	constructor(userId: number, instanceId: number) {
		this.wsClient = new GameWS(instanceId, this.onSocketStateUpdate.bind(this), this.onSocketError.bind(this));

		this.app = new TranscendanceApp(
			userId,
			{
				view: document.getElementById("game-canvas") as HTMLCanvasElement,
				resolution: window.devicePixelRatio || 1,
				resizeTo: document.getElementsByClassName("game-display").item(0) as HTMLElement,
				antialias: true,
				autoDensity: true,
				// backgroundColor: 0x6495ed,
				backgroundColor: 0x000000,
				width: 500,
				height: 500
			}
		);

		window.addEventListener("keydown", this.onKeyDown.bind(this));
		window.addEventListener("keyup", this.onKeyUp.bind(this));
	}

	destroy() {
		this.gciState = GCI_STATE.ENDED;
		this.app.destroy();
		this.wsClient.destroy();
	}

	run() {
		this.gciState = GCI_STATE.RUNNING;

		const l_racket : PlayerRacket = new PlayerRacket(this.app, PlayerRacketUnit.LEFT);
		const r_racket : PlayerRacket = new PlayerRacket(this.app, PlayerRacketUnit.RIGHT);

		if (this.currentResponseState?.playerOne.id === this.app.userId)
			this.app.playerRacket = PlayerRacketUnit.LEFT;
		else if (this.currentResponseState?.playerTwo.id === this.app.userId)
			this.app.playerRacket = PlayerRacketUnit.RIGHT;
		
		this.app.stage.addChild(l_racket);
		this.app.stage.addChild(r_racket);
		this.app.ticker.add(this.actionSender, this);
	}

	onSocketStateUpdate(newState: ResponseState) {
		this.previousResponseState = this.currentResponseState;
		this.currentResponseState = newState;
		// console.log(this.currentResponseState);
		if (this.gciState === GCI_STATE.SETUP)
			this.run();
	}

	onSocketError(e: any) {
		this.gciState = GCI_STATE.WS_ERROR;
		console.log(e.message); 
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
};

export { GameClientInstance };

// var app: Application;

// export function exec(wsServer: GameWS) {
// 	const app = new GameClientInstance(wsServer);

// 	const text: Text = new Text('yes!', { fontFamily: 'arial', fontSize: 32, fill: 0xFFFFFF });
// 	// const zoneShow : Graphics = new Graphics();

// 	const l_racket : PlayerRacket = new PlayerRacket(app.app, PlayerRacketUnit.LEFT);
// 	const r_racket : PlayerRacket = new PlayerRacket(app.app, PlayerRacketUnit.RIGHT);

// 	text.pivot.set(text.width / 2, text.height / 2);
// 	text.x = app.app.screen.width / 2;
// 	text.y = app.app.screen.height / 10 * 9;
// 	text.angle = 0;

// 	window.addEventListener("resize", (function(ev: UIEvent) {
// 		text.x = app.app.screen.width / 2;
// 		text.y = app.app.screen.height / 10 * 9;

// 	}).bind(window));

// 	// app.stage.addChild(zoneShow);
// 	app.app.stage.addChild(text);
// 	app.app.stage.addChild(l_racket);
// 	app.app.stage.addChild(r_racket);
// }