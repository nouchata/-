import { ChannelType } from "./user-channels.dto";

export interface GetChannelDto
{
	id: number;
	name: string;
	channelType: ChannelType;
}
