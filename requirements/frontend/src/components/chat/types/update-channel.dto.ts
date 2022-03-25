import { User } from "./user-channels.dto";

export interface UpdateChannelDto {
	id: number;
	name: string;
	admins: User[];
	owner: User;
	channelType: 'public' | 'private' | 'protected';
}