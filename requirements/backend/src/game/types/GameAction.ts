enum GA_KEY {
	UP,
	DOWN,
	SPACE
};

type GameAction = {
	id: number;
	keyPressed: GA_KEY;
	data: { x?: number, y?: number };
};

export { GameAction, GA_KEY };