import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class FindUsersByDisplayNameDTO {
	@ApiProperty({
		description: 'display name fragment to search for',
		example: 'Theo',
	})
	@IsNotEmpty()
	displaynamefragment: string;

	@ApiProperty({
		description: 'maximum number of results to return',
		example: 8,
	})
	@IsNumber()
	maxresults: number;

	@ApiProperty({ description: 'offset into the result set', example: 1 })
	@IsNumber()
	offset: number;
}
