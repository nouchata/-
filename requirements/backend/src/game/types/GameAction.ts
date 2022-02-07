enum GA_KEY {
	UP,
	DOWN,
	SPACE
};

type GameAction = {
	id: number;
	keyPressed: GA_KEY;
};

export { GameAction, GA_KEY };