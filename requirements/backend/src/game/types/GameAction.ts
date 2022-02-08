enum GA_KEY {
	NONE,
	UP,
	DOWN,
	SPACE
};

type GameAction = {
	id: number;
	keyPressed: GA_KEY;
	data: { x?: number, y?: number, chargingOn?: boolean };
};

export { GameAction, GA_KEY };