enum GA_KEY {
	NONE,
	UP,
	DOWN,
	SPACE
};

export type GameAction = {
	id: number;
	keyPressed: GA_KEY;
	data: { x?: number, y?: number, chargingOn?: boolean };
};

export { GA_KEY };