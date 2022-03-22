import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional } from 'class-validator';
import { ChannelType } from './create-channel.dto';

export class EditChannelDto {
	@IsNotEmpty()
	@IsOptional()
	@ApiProperty({
		description: 'The name of the channel',
		example: 'My Channel',
		required: false,
	})
	name?: string;

	@IsIn(['private', 'protected', 'public'])
	@ApiProperty({
		description: 'The type of the channel',
		example: 'public',
	})
	type: ChannelType;

	@ApiProperty({
		description: 'The password of the channel if it is protected',
		example: 'password',
		required: false,
	})
	@IsOptional()
	@IsNotEmpty()
	password?: string;
}
