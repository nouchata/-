import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsNotEmpty } from "class-validator";

export type ChannelType = 'private' | 'protected' | 'public';


export class CreateChannelDto {
	@IsNotEmpty()
	@ApiProperty({
		description: 'The name of the channel',
		example: 'My Channel',
	})
	name: string;

	@IsIn(['private', 'protected', 'public'])
	@ApiProperty({
		description: 'The type of the channel',
		example: 'public',
	})
	channelType: ChannelType;
}
