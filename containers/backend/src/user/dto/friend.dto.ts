import { ApiProperty } from '@nestjs/swagger';
import { User } from '../entities/user.entity';
import { UserStatus } from '../interface/UserInterface';

export class FriendDTO {
	@ApiProperty({
		description: "Friend's id",
		example: '1',
	})
	id: number;

	@ApiProperty({
		description: "Friend's display name",
		example: 'mamartin',
	})
	displayName: string;

	@ApiProperty({
		description: "Friend's picture filename",
		example: '7595fdac-3846-4c36-9bf4-89788f1c1971.jpg',
	})
	picture: string;

	@ApiProperty({
		description: "Friend's current status",
		example: 'online',
	})
	status: UserStatus;

	static async fromEntity(
		entity: User,
		getUserStatus: (user: { id: number }) => Promise<UserStatus>
	): Promise<FriendDTO> {
		const { id, displayName } = entity;
		let picture = entity.picture;
		const status = await getUserStatus(entity);

		if (!picture) {
			picture = 'default.jpg';
		}

		return { id, displayName, picture, status };
	}
}
