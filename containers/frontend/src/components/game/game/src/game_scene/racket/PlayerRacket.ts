import { GlitchFilter } from "@pixi/filter-glitch";
import { GameAction, GA_KEY } from "../../../types/GameAction";
import { PlayerState } from "../../../types/PlayerState";
import { ResponseState } from "../../../types/ResponseState";
import { TranscendanceApp } from "../../TranscendanceApp";
import { Racket, RacketUnit, toPx } from "./Racket";

class PlayerRacket extends Racket {

	private currentlyCastingPower: boolean = false;

	constructor(appRef : TranscendanceApp, unit : RacketUnit) {
		super(appRef, unit);
		this.appRef.ticker.add(this.update, this);
	}

	update(delta: number) {
		// const actualPerPos: number = toPer(this.absolutePosition.y, this.currScreenSize);
		let redraw: boolean = false;
		this.getServerFlags();

		this.deltaTotal += delta;
		if ((this.selectCorrectUnit() as PlayerState).flags.stuned) {
			this.absolutePosition.y = toPx((this.selectCorrectUnit() as PlayerState).pos.y, this.appRef.screen.height);
			this.y = this.absolutePosition.y;
			this.appRef.gciMaster.computedGameActions = {};
		}
		else
			this.absolutePosition.y = toPx(this.manageMovementReconciliation(), this.appRef.screen.height);

		// various updates
		if ((this.selectCorrectUnit() as PlayerState).flags.stuned)
			this.angle = 0;
		else
			this.manageAngle(delta, this.manageMovement(delta));
		redraw = this.capacityCharging(delta) || redraw;
		redraw = this.rainbowingRacket(delta) || redraw;
		if (redraw)
			this.draw();
		this.handleCapacityCharging();

		// charging fix
		if ((this.selectCorrectUnit() as PlayerState).capacityTimeTrigger && !this.currentlyCastingPower)
			this.currentlyCastingPower = true;
		if (!(this.selectCorrectUnit() as PlayerState).capacityTimeTrigger && this.currentlyCastingPower) {
			this.cancelCharging = true;
			this.currentlyCastingPower = false;
		}

		// filters update
		if (this.filters && (this.filters[1] as GlitchFilter).enabled)
			(this.filters[1] as GlitchFilter).refresh();
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

	protected capacityCharging(delta: number) : boolean {
		if ((this.appRef.gciMaster.currentResponseState as ResponseState).gameOptions.gameType === "extended") {
			let playerState: PlayerState = this.selectCorrectUnit() as PlayerState;
			if (this.cancelCharging) {
				this.localCapacityChargingState = false;
				this.cancelCharging = false;
			}
			if (this.localCapacityChargingState) {
				this.x = this.absolutePosition.x + (Math.cos(Math.random() * this.deltaTotal * 0.1) * (0.1 * this.capacityLoader));
				this.y = this.absolutePosition.y + (Math.sin(Math.random() * this.deltaTotal * 0.1) * (0.1 * this.capacityLoader));
				if (this.capacityLoader < 100) {
					this.capacityLoader = 
						this.capacityLoader + delta * ((this.appRef.gciMaster.currentResponseState as ResponseState).gameOptions.capChargingPPS / this.appRef.ticker.FPS) > 100 ? 
						100 : this.capacityLoader + delta * ((this.appRef.gciMaster.currentResponseState as ResponseState).gameOptions.capChargingPPS / this.appRef.ticker.FPS);
					// 20% ease range
					if (this.capacityLoader - playerState.capacityLoaderPercentage > 20 || this.capacityLoader - playerState.capacityLoaderPercentage < -20)
						this.capacityLoader = playerState.capacityLoaderPercentage;
					return (true);
				}
			}
			if (!this.localCapacityChargingState || !playerState.stockedCapacity) {
				this.localCapacityChargingState = false;
				if (this.capacityLoader) {
					this.capacityLoader = 
						this.capacityLoader - delta * ((this.appRef.gciMaster.currentResponseState as ResponseState).gameOptions.capChargingPPS / this.appRef.ticker.FPS) < 0 ?
						0 : this.capacityLoader - delta * ((this.appRef.gciMaster.currentResponseState as ResponseState).gameOptions.capChargingPPS / this.appRef.ticker.FPS);
					this.x = this.absolutePosition.x;
					this.y = this.absolutePosition.y;
					return (true);
				}
			}
		}
		return (false);
	}

	// network related functions
	protected manageMovementReconciliation() : number {
		let serverState: PlayerState = this.selectCorrectUnit() as PlayerState;
		let lastServProcessedAction: number = this.selectCorrectUnit(true) as number + 1;
		let reconciliatedPos: number = serverState.pos.y;
		for (; this.appRef.gciMaster.computedGameActions[lastServProcessedAction] ; lastServProcessedAction++)
			if ((this.appRef.gciMaster.computedGameActions[lastServProcessedAction] as GameAction).data.y &&
			(this.appRef.gciMaster.computedGameActions[lastServProcessedAction] as GameAction).keyPressed)
				reconciliatedPos = (this.appRef.gciMaster.computedGameActions[lastServProcessedAction] as GameAction).data.y as number;
		return (reconciliatedPos);
	}

	protected handleCapacityCharging(): void {
		if ((this.appRef.gciMaster.currentResponseState as ResponseState).gameOptions.gameType === "extended" && (this.selectCorrectUnit() as PlayerState).stockedCapacity) {
			if (!this.localCapacityChargingState && this.appRef.actualKeysPressed.space && !(this.selectCorrectUnit() as PlayerState).flags.capacityCharging &&
				!(this.selectCorrectUnit() as PlayerState).capacityTimeTrigger)
			{
				this.appRef.gciMaster.lastLocalGameActionComputed++;
				this.appRef.gciMaster.computedGameActions[this.appRef.gciMaster.lastLocalGameActionComputed] = {
					id: this.appRef.gciMaster.lastLocalGameActionComputed,
					keyPressed: GA_KEY.SPACE,
					data: { chargingOn: true }
				};
				this.localCapacityChargingState = true;
				this.capacityLoader = 0;
			}
			else if (this.localCapacityChargingState && !this.appRef.actualKeysPressed.space && (this.selectCorrectUnit() as PlayerState).flags.capacityCharging)
			{
				this.appRef.gciMaster.lastLocalGameActionComputed++;
				this.appRef.gciMaster.computedGameActions[this.appRef.gciMaster.lastLocalGameActionComputed] = {
					id: this.appRef.gciMaster.lastLocalGameActionComputed,
					keyPressed: GA_KEY.SPACE,
					data: { chargingOn: false }
				};
				this.localCapacityChargingState = false;
				this.x = this.absolutePosition.x;
				this.y = this.absolutePosition.y;
			}
		} 
	}

	public destroy() {
		this.appRef.ticker.remove(this.update, this);
		super.destroy();
	}
}

export { PlayerRacket };