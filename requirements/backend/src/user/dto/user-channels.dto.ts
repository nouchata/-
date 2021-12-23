import { ApiProperty } from "@nestjs/swagger";
import { User } from "../entities/user.entity";


export class MessageDto
{
	@ApiProperty({description: 'id of the message', example: 45})
	id: number;

	@ApiProperty({description: 'text of the message', example: 'hello'})
	text: string;

	@ApiProperty({description: 'id of the user who wrote the message', example: 45})
	userId: number;
}

export class UserChannelsDto {

	@ApiProperty({description: 'id of the channel', example: 45})
	id: number;

	@ApiProperty({description: 'name of the channel', example: 'yolo'})
	name: string;

	@ApiProperty({description: 'Owner of the channel', type: User})
	owner: User;

	@ApiProperty({description: 'Users of the channel', type: [User]})
	users: User[];

	@ApiProperty({description: 'Messages of the channel', type: [MessageDto]})
	messages: MessageDto[];
}
