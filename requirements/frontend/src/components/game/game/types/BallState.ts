export type BallFlags = {
	rainbow: boolean;
	smash: boolean;
	freezed: boolean;
	showed: boolean;
};

export type BallState = {
	pos: { x: number, y: number };
	directionVector: { x: number, y: number };
	speedPPS: number;
	flags: BallFlags;
};