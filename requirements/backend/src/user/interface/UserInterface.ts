export type UserRole = 'user' | 'moderator' | 'admin';

export type UserStatus = 'online' | 'offline' | 'ingame';

export type UserMatchHistory = {
	players: [string, string];	// winner name / loser name
	score: [number, number];	// winner / loser
	duration: number;			// in seconds
}

export interface UserInterface {
	login: string;
	displayName: string;
	profileURL: string;
	email?: string;
	picture?: string;
	role: UserRole;
}
