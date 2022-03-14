import { PunishmentType } from '../entities/punishment.entity';
import {
	IsNumber,
	IsString,
	IsOptional,
	IsIn,
	IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePunishmentDto {
	@IsNumber()
	@ApiProperty({
		description: 'the id of the channel',
		example: 1,
	})
	userId: number;

	@IsNumber()
	@ApiProperty({
		description: 'the id of the channel',
		example: 1,
	})
	channelId: number;

	@IsString()
	@IsOptional()
	@ApiProperty({
		description: 'the reason of the punishment',
		example: 'spamming',
	})
	reason?: string;

	@IsIn(['ban', 'mute'])
	@ApiProperty({
		description: 'the type of the punishment',
		example: 'ban',
	})
	type: PunishmentType;

	@IsOptional()
	@IsDateString()
	@ApiProperty({
		description: 'the date of the punishment',
	})
	expiration?: Date;
}
