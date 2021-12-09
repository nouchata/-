export type UserRole = 'user' | 'moderator' | 'admin';

export type UserStatus = 'online' | 'offline' | 'ingame';

export interface UserInterface {
	login: string;
	displayName: string;
	profileURL: string;
	email?: string;
	picture?: string;
	role: UserRole;
}
