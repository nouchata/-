import { IsNumber, IsPositive, IsString, Max, Min } from "class-validator";

class GameOptions {

	@IsString()
	gameType: "standard" | "extended";

	/* percentage filling per second of the capacity trigger in extented play */
	@IsNumber({
		allowInfinity: false,
		allowNaN: false
	})
	@Min(0)
	@Max(100)
	capChargingPPS: number;

	/* percentage of screen traveled per second by the racket (vertical) */
	@IsNumber({
		allowInfinity: false,
		allowNaN: false
	})
	@Min(0)
	@Max(100)
	yDistPPS: number;

	/* vertical size of the rackets (100 / racketSize) */
	@IsNumber({
		allowInfinity: false,
		allowNaN: false
	})
	@IsPositive()
	racketSize: number;

	/* default ball speed */
	@IsNumber({
		allowInfinity: false,
		allowNaN: false
	})
	@IsPositive()
	ballSpeedPPS: number;

	constructor(values: Partial<GameOptions>) {
		this.gameType		= values.gameType ? values.gameType : 'standard';
		this.capChargingPPS	= values.capChargingPPS ? values.capChargingPPS : 100 / 3;
		this.yDistPPS		= values.yDistPPS ? values.yDistPPS : 50;
		this.racketSize		= values.racketSize ? values.racketSize : 6;
		this.ballSpeedPPS	= values.ballSpeedPPS ? values.ballSpeedPPS : 50;
	}
}

export { GameOptions };