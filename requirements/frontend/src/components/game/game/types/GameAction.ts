enum GA_KEY {
	NONE,
	UP,
	DOWN,
	SPACE
};

export type GameAction = {
	id: number;
	keyPressed: GA_KEY;
	data: { x?: number, y?: number };
};

export { GA_KEY };