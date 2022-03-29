import { RacketFlags } from "./RacketFlags";

enum PLAYER_CAPACITY {
	NONE,
	SMASH,
	BLIND,
	STUNNING
};

export type PlayerState = {
	/* player profile id */
	id: number;
	/* ws state */
	connected: boolean;
	/* x is actually worthless in server-side though */
	pos: { x: number | undefined, y: number };
	flags: RacketFlags;
	score: number;
	/* actual percentage of the capacity loader */
	capacityLoaderPercentage: number;
	/* capacity related */
	capacityUnlockerPercentage: number;
	stockedCapacity: PLAYER_CAPACITY;
	capacityTimeTrigger: number;
}

export { PLAYER_CAPACITY };