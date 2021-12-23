export type UserRole = 'user' | 'moderator' | 'admin';


export interface User
{
	id: number;
	login: string;
	picture: string;
	role: UserRole;
	displayName: string;
	profileURL: string;
	email?: string;
}

export interface MessageDto
{
	id: number;
	text: string;
	userId: number;
}

export interface UserChannelsDto {

	id: number;
	name: string;
	owner: User;
	users: User[];
	messages: MessageDto[];
}
