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
		let actualPerPos: number = toPer(this.absolutePosition.y, this.currScreenSize);
		this.deltaTotal += delta;

		let playerData : PlayerState = this.unit === RacketUnit.LEFT ?
		(this.appRef.gciMaster.currentResponseState as ResponseState).playerOne :
		(this.appRef.gciMaster.currentResponseState as ResponseState).playerTwo;

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
		}

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
}

export { SpectatorRacket };