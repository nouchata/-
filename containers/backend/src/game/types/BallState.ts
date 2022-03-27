type BallFlags = {
	rainbow: boolean;
	smash: boolean;
	freezed: boolean;
	showed: boolean;
};

type BallState = {
	pos: { x: number, y: number };
	directionVector: { x: number, y: number };
	speedPPS: number;
	flags: BallFlags;
};

export { BallState, BallFlags };