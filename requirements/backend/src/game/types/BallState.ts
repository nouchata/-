type BallState = {
	pos: { x: number, y: number };
	directionVector: { x: number, y: number };
	headingRight: boolean;
	headingTop: boolean;
	speedPPS: number;
	flags: {
		rainbow: boolean;
		smash: boolean;
		freezed: boolean;
		showed: boolean;
	};
};

export { BallState };