export type UserRole = 'standard' | 'moderator' | 'admin';

export type UserState = 'online' | 'offline' | 'ingame';

export interface UserInterface {
	login: string;	
}

export interface UserMatchHistory {
	players: [number, number];	// winner / loser
	score: [number, number];	// winner / loser
	duration: number;			// in seconds
}
