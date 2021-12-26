import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsNotEmpty, IsOptional } from "class-validator";

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

	// optional
	@ApiProperty({
		description: 'The password of the channel if it is protected',
		example: 'password',
		required: false,
	})
	@IsOptional()
	@IsNotEmpty()
	password?: string;

}
