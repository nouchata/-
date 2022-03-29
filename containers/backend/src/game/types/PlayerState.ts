import { RacketFlags } from "./RacketFlags";

enum PLAYER_CAPACITY {
	NONE,
	SMASH,
	BLIND,
	STUNNING
};

const playerCapacityDelay: Array<number> = [0, 500, 2000, 700];

type PlayerState = {
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

export { PlayerState, PLAYER_CAPACITY, playerCapacityDelay };