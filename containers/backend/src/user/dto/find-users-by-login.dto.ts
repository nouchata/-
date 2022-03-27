import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class FindUsersByLoginDTO {
	@ApiProperty({
		description: 'login fragment to search for',
		example: 'tmatis',
	})
	@IsNotEmpty()
	loginfragment: string;

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
