export type UserRole = 'user' | 'moderator' | 'admin';
export type ChannelType = 'private' | 'protected' | 'public';


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

export interface ChannelDto {

	id: number;
	name: string;
	channelType: ChannelType;
	owner: User;
	users: User[];
	messages: MessageDto[];
}
