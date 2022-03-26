import { UserStatus } from "../../utils/StatusDisplay";

export type UserRole = 'user' | 'moderator' | 'admin';
export type ChannelType = 'private' | 'protected' | 'public' | 'direct';
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
	status: UserStatus;
}

export interface MessageDto
{
	id: number;
	messageType: MessageType;
	text: string;
	userId?: number;
}

export interface BaseChannel {
	name: string;
	id: number;
	users: User[];
	messages: MessageDto[];
	createdAt: Date;
}

export interface GroupChannel extends BaseChannel {
	channelType: 'public' | 'protected' | 'private';
	owner: User;
	admins: User[];
}

export interface ProtectedChannel extends GroupChannel {
	channelType: 'protected';
}

export interface StandardChannel extends GroupChannel {
	channelType: 'public' | 'private';
}

export interface DirectChannel extends BaseChannel {
	channelType: 'direct';
}

export type ChannelDto = ProtectedChannel | StandardChannel | DirectChannel;

