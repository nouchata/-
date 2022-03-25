import { UserDto } from './../../user/entities/user.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MessageType } from '../entities/message.entity';

export class MessageDto {
	@ApiProperty({ description: 'id of the message', example: 45 })
	id: number;

	@ApiProperty({ description: 'type of the message', example: 'user' })
	messageType: MessageType;

	@ApiProperty({ description: 'text of the message', example: 'hello' })
	text: string;

	@ApiPropertyOptional({
		description: 'id of the user who wrote the message',
		example: 45,
	})
	userId?: number;
}

export class ChannelDto {
	@ApiProperty({ description: 'id of the channel', example: 45 })
	id: number;

	@ApiProperty({ description: 'name of the channel', example: 'yolo' })
	name?: string;

	@ApiProperty({ description: 'type of the channel', example: 'private' })
	channelType: string;

	@ApiProperty({ description: 'Owner of the channel', type: UserDto })
	owner?: UserDto;

	@ApiProperty({ description: 'Admins of the channel', type: [UserDto] })
	admins: UserDto[];

	@ApiProperty({ description: 'Users of the channel', type: [UserDto] })
	users: UserDto[];

	@ApiProperty({ description: 'Messages of the channel', type: [MessageDto] })
	messages: MessageDto[];
}
