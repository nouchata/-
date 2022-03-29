import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class LeaveChannelDto {
	@IsNotEmpty()
	@IsNumber()
	@ApiProperty({
		description: 'The id of the channel',
		example: 1,
	})
	id: number;
}
