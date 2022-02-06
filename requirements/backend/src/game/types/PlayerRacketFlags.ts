type PlayerRacketFlags = {
	/* stands for the not-meant-to-change-the-pos animations */
	falsePosAnimation: boolean,
	/* is the player currently charging his capacity bar */
	capacityCharging: boolean,
	/* is the player stunted */
	stunted: boolean,
	/* is the racket rainbowing */
	rainbowing: boolean
};

export { PlayerRacketFlags };