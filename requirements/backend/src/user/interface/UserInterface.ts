export type UserRole = 'user' | 'moderator' | 'admin';

export interface UserInterface {
	login: string;
	displayName: string;
	profileURL: string;
	email?: string;
	picture?: string;	
	role: UserRole;
}
