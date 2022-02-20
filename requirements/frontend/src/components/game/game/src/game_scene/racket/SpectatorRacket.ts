import { GA_KEY } from "../../../types/GameAction";
import { PlayerState } from "../../../types/PlayerState";
import { ResponseState } from "../../../types/ResponseState";
import { TranscendanceApp } from "../../TranscendanceApp";
import { Racket, RacketUnit, toPer, toPx } from "./Racket";

class SpectatorRacket extends Racket {
	constructor(appRef : TranscendanceApp, unit : RacketUnit) {
		super(appRef, unit);
		this.appRef.ticker.add(this.update, this);
	}

	update(delta: number) {
		const actualPerPos: number = toPer(this.absolutePosition.y, this.currScreenSize);
		let redraw: boolean = false;

		this.deltaTotal += delta;

		const playerData : PlayerState = this.selectCorrectUnit() as PlayerState;

		if (actualPerPos > playerData.pos.y) { // to top
			// lag proof smooth movement or teleportation if there's too much delay (10% ahead for a 50% per sec)
			if (actualPerPos - playerData.pos.y > (this.appRef.gciMaster.currentResponseState as ResponseState).gameOptions.yDistPPS / 5)
				this.absolutePosition.y = toPx(playerData.pos.y, this.appRef.screen.height);
			else
				this.manageAngle(delta, this.manageMovement(delta, toPx(playerData.pos.y, this.appRef.screen.height)));
		} else if (actualPerPos < playerData.pos.y) {
			if (playerData.pos.y - actualPerPos > (this.appRef.gciMaster.currentResponseState as ResponseState).gameOptions.yDistPPS / 5)
				this.absolutePosition.y = toPx(playerData.pos.y, this.appRef.screen.height);
			else
				this.manageAngle(delta, this.manageMovement(delta, toPx(playerData.pos.y, this.appRef.screen.height)));
		} else {
			this.manageAngle(delta, GA_KEY.NONE);
		}

		redraw = this.capacityCharging(delta) || redraw;
		redraw = this.rainbowingRacket(delta) || redraw;
		if (redraw)
			this.draw();

		if (this.filterState.update) {
			this.filterState.update = false;
			this.filters = this.filterState.array;
		}
	}

	protected manageMovement(delta: number, spectatorValue: number) : GA_KEY {
		if (this.absolutePosition.y > spectatorValue) {
			// movement
			if (this.absolutePosition.y - (((this.appRef.screen.height / 100 * this.movSpeed) / this.appRef.ticker.FPS) * delta) > spectatorValue)
				this.absolutePosition.y = this.absolutePosition.y - (((this.appRef.screen.height / 100 * this.movSpeed) / this.appRef.ticker.FPS) * delta);
			else
				this.absolutePosition.y = spectatorValue;
			// not update if it's an absolute animation bc itll do itself
			if (!this.flags.falsePosAnimation)
				this.y = this.absolutePosition.y;
			return (GA_KEY.UP);
		} else if (this.absolutePosition.y < spectatorValue) {
			if (this.absolutePosition.y + (((this.appRef.screen.height / 100 * this.movSpeed) / this.appRef.ticker.FPS) * delta) < spectatorValue)
				this.absolutePosition.y = this.absolutePosition.y + (((this.appRef.screen.height / 100 * this.movSpeed) / this.appRef.ticker.FPS) * delta);
			else
				this.absolutePosition.y = spectatorValue;
			if (!this.flags.falsePosAnimation)
				this.y = this.absolutePosition.y;
			return (GA_KEY.DOWN);
		}
		return (GA_KEY.NONE);
	}

	protected capacityCharging(delta: number) : boolean {
		if ((this.appRef.gciMaster.currentResponseState as ResponseState).gameOptions.gameType === "extended") {
			let playerState: PlayerState = this.selectCorrectUnit() as PlayerState;
			if (this.cancelCharging) {
				this.localCapacityChargingState = false;
				this.cancelCharging = false;
			}
			if (playerState.flags.capacityCharging) {
				if (!this.localCapacityChargingState) {
					this.localCapacityChargingState = true;
					this.capacityLoader = 0;
				}
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
			if (!playerState.flags.capacityCharging) {
				if (this.localCapacityChargingState) {
					this.localCapacityChargingState = false;
					this.x = this.absolutePosition.x;
					this.y = this.absolutePosition.y;
				}
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
}

export { SpectatorRacket };