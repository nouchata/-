type GameOptions = {
	gameType: "standard" | "extended";

	/* percentage filling per second of the capacity trigger in extented play */
	capChargingPPS: number;
	/* percentage of screen traveled per second by the racket (vertical) */
	yDistPPS: number;
	/* vertical size of the rackets (100 / racketSize) */
	racketSize: number;
}

export { GameOptions };