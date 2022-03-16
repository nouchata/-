export type UserRole = 'user' | 'moderator' | 'admin';
export type ChannelType = 'private' | 'protected' | 'public';
export type MessageType = "user" | "system";

export interface User
{
	id: number;
	login: string;
	picture: string;
	role: UserRole;
	displayName: string;
	profileURL: string;
	email?: string;
	status: string;
}

export interface MessageDto
{
	id: number;
	messageType: MessageType;
	text: string;
	userId?: number;
}

export interface ChannelDto {
	id: number;
	name: string;
	channelType: ChannelType;
	owner: User;
	users: User[];
	admins: User[];
	messages: MessageDto[];
}
