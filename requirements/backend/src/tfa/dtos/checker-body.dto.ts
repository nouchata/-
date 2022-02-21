import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class CheckerBodyDTO {
	@ApiProperty({
		description: 'Code submitted by the user (6 chars)',
		example: '123456',
	})
	@IsString()
	@Length(6, 6)
	givenCode: string;
}
