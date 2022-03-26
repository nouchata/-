import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class JoinChannelDto {
	@IsNotEmpty()
	@IsNumber()
	@ApiProperty({
		description: 'The id of the channel',
		example: 1,
	})
	id: number;

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
