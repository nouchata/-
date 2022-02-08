import { GameAction, GA_KEY } from "../../../types/GameAction";
import { PlayerState } from "../../../types/PlayerState";
import { ResponseState } from "../../../types/ResponseState";
import { TranscendanceApp } from "../../TranscendanceApp";
import { Racket, RacketUnit, toPer, toPx } from "./Racket";

class PlayerRacket extends Racket {
	constructor(appRef : TranscendanceApp, unit : RacketUnit) {
		super(appRef, unit);
		this.appRef.ticker.add(this.update, this);
	}

	update(delta: number) {
		// const actualPerPos: number = toPer(this.absolutePosition.y, this.currScreenSize);
		this.deltaTotal += delta;
		this.absolutePosition.y = toPx(this.manageMovementReconciliation(), this.appRef.screen.height);

		if (!this.appRef.actualKeysPressed.space && this.flags.capacityCharging) {
			this.flags.capacityCharging = false;
			this.flags.falsePosAnimation = false;
			this.flags.rainbowing = false;

			// sometimes there is pos artifacts after twitching w/out that
			this.x = this.absolutePosition.x;
			this.y = this.absolutePosition.y;
		}
		if (this.appRef.actualKeysPressed.space && !this.flags.capacityCharging /* && other conditions like having a power available */) {
			this.flags.capacityCharging = true;
			this.flags.falsePosAnimation = true;
			this.flags.rainbowing = true;
			this.capacityLoader = 0;
		}

		// various updates
		this.manageAngle(delta, this.manageMovement(delta));
		this.capacityCharging(delta);
		this.rainbowingRacket(delta);

		// filters update
		if (this.filterState.update) {
			this.filterState.update = false;
			this.filters = this.filterState.array;
		}
	}

	protected manageMovement(delta: number) : GA_KEY {
		if (this.appRef.actualKeysPressed.up && this.absolutePosition.y > this.appRef.screen.height / (this.appRef.gciMaster.currentResponseState as ResponseState).gameOptions.racketSize / 2) {
			// movement
			if (this.absolutePosition.y - (((this.appRef.screen.height / 100 * this.movSpeed) / this.appRef.ticker.FPS) * delta) > this.appRef.screen.height / (this.appRef.gciMaster.currentResponseState as ResponseState).gameOptions.racketSize / 2)
				this.absolutePosition.y = this.absolutePosition.y - (((this.appRef.screen.height / 100 * this.movSpeed) / this.appRef.ticker.FPS) * delta);
			else
				this.absolutePosition.y = this.appRef.screen.height / (this.appRef.gciMaster.currentResponseState as ResponseState).gameOptions.racketSize / 2;
			// not update if it's an absolute animation bc itll do itself
			if (!this.flags.falsePosAnimation)
				this.y = this.absolutePosition.y;
			// register the event for the server
			this.appRef.gciMaster.lastLocalGameActionComputed++;
			this.appRef.gciMaster.computedGameActions[this.appRef.gciMaster.lastLocalGameActionComputed] = {
				id: this.appRef.gciMaster.lastLocalGameActionComputed,
				keyPressed: GA_KEY.UP,
				data: { y: (this.absolutePosition.y / (this.currScreenSize / 100)) }
			};
			return (GA_KEY.UP);
		} else if (this.appRef.actualKeysPressed.down && this.absolutePosition.y < this.appRef.screen.height - this.appRef.screen.height / (this.appRef.gciMaster.currentResponseState as ResponseState).gameOptions.racketSize / 2) {
			if (this.absolutePosition.y + (((this.appRef.screen.height / 100 * this.movSpeed) / this.appRef.ticker.FPS) * delta) < this.appRef.screen.height - this.appRef.screen.height / (this.appRef.gciMaster.currentResponseState as ResponseState).gameOptions.racketSize / 2)
				this.absolutePosition.y = this.absolutePosition.y + (((this.appRef.screen.height / 100 * this.movSpeed) / this.appRef.ticker.FPS) * delta);
			else
				this.absolutePosition.y = this.appRef.screen.height - this.appRef.screen.height / (this.appRef.gciMaster.currentResponseState as ResponseState).gameOptions.racketSize / 2;
			if (!this.flags.falsePosAnimation)
				this.y = this.absolutePosition.y;
			this.appRef.gciMaster.lastLocalGameActionComputed++;
			this.appRef.gciMaster.computedGameActions[this.appRef.gciMaster.lastLocalGameActionComputed] = {
				id: this.appRef.gciMaster.lastLocalGameActionComputed,
				keyPressed: GA_KEY.DOWN,
				data: { y: (this.absolutePosition.y / (this.currScreenSize / 100)) }
			};
			return (GA_KEY.DOWN);
		}
		if (!this.flags.falsePosAnimation)
			this.y = this.absolutePosition.y;
		return (GA_KEY.NONE);
	}

	protected manageMovementReconciliation() : number {
		let serverState: PlayerState = this.selectCorrectUnit() as PlayerState;
		let lastServProcessedAction: number = this.selectCorrectUnit(true) as number + 1;
		let reconciliatedPos: number = serverState.pos.y;
		for (; this.appRef.gciMaster.computedGameActions[lastServProcessedAction] ; lastServProcessedAction++)
			if ((this.appRef.gciMaster.computedGameActions[lastServProcessedAction] as GameAction).data.y)
				reconciliatedPos = (this.appRef.gciMaster.computedGameActions[lastServProcessedAction] as GameAction).data.y as number;
		return (reconciliatedPos);
	}
}

export { PlayerRacket };