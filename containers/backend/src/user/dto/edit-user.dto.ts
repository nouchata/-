import { ApiProperty } from '@nestjs/swagger';
import {
	IsOptional,
	IsString,
	IsIn,
	Length
} from 'class-validator';

export class EditUserDTO {

	@ApiProperty({
		description: 'new displayName of the user',
		example: 'mamartin',
	})
	@IsString()
	@IsOptional()
	@Length(3, 15)
	username?: string;

	@IsString()
	@IsOptional()
	@IsIn(['true', 'false'])
	@ApiProperty({ description: 'state of the 2FA auth', example: 'true' })
	twofa?: string;
}
