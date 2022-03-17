import { ApiProperty } from '@nestjs/swagger';
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Channel } from 'src/chat/entities/channel.entity';
import { User, UserDto } from 'src/user/entities/user.entity';
import {
	Column,
	CreateDateColumn,
	Entity,
	ManyToOne,
	PrimaryGeneratedColumn,
} from 'typeorm';

export type PunishmentType = 'ban' | 'mute';

export class PunishmentDto {
	@ApiProperty({
		description: 'the id of the punishment',
		example: 1,
	})
	id: number;

	@ApiProperty({
		description: 'the punished user',
		type: () => UserDto,
	})
	user: UserDto;

	@ApiProperty({
		description: 'the reason of the punishment',
		example: 'spamming',
	})
	reason?: string;

	@ApiProperty({
		description: 'the type of the punishment',
		example: 'ban',
	})
	type: PunishmentType;

	@ApiProperty({
		description: 'the display name of the admin who created the punishment',
		example: 'Froz',
	})
	admin: string;

	@ApiProperty({
		description: 'the date of the expiration',
		example: '2020-01-01T00:00:00.000Z',
	})
	expiration?: Date;

	@ApiProperty({
		description: 'the date of the punishment',
		example: '2020-01-01T00:00:00.000Z',
	})
	createdAt: Date;
}

@Entity({ name: 'punishements' })
export class Punishment {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne((type) => User)
	user: User;

	@ManyToOne((type) => Channel, {
		onDelete: 'CASCADE',
	})
	channel: Channel;

	@Column({ nullable: true })
	reason?: string;

	@Column()
	type: PunishmentType;

	@Column({
		nullable: true,
		type: 'timestamp',
	})
	expiration?: Date;

	@Column()
	admin: string;

	@CreateDateColumn()
	createdAt: Date;

	toDto(): PunishmentDto {
		return {
			id: this.id,
			user: this.user.toDto(),
			reason: this.reason,
			type: this.type,
			expiration: this.expiration,
			admin: this.admin,
			createdAt: this.createdAt,
		};
	}
}
