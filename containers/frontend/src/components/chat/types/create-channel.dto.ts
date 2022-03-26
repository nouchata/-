import { ChannelType } from "./user-channels.dto";

export interface CreateChannelDto {
	name: string;

	channelType: ChannelType;

	password?: string;
}