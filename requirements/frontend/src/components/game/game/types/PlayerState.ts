import { RacketFlags } from "./RacketFlags";

enum PLAYER_CAPACITY {
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
	/* actual percentage of the capacity loader */
	capacityLoaderPercentage: number;
	/* stocked capacity */
	stockedCapacity: PLAYER_CAPACITY | undefined;
}

export { PLAYER_CAPACITY };