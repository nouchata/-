import { ChannelType } from "./user-channels.dto";

export interface EditChannelDto {
	name?: string;
	type: ChannelType;
	password?: string;
}