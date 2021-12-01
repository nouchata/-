export type UserRole = 'standard' | 'moderator' | 'admin';

export type UserStatus = 'online' | 'offline' | 'ingame';

export type UserMatchHistory = {
	players: [number, number];	// winner id / loser id
	score: [number, number];	// winner / loser
	duration: number;			// in seconds
}

export interface UserInterface {
	login: string;
}