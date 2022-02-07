enum GA_KEY {
	UP,
	DOWN,
	SPACE
};

export type GameAction = {
	id: number;
	keyPressed: GA_KEY;
};

export { GA_KEY };