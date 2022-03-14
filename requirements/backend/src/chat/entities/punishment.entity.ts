import { ApiProperty } from '@nestjs/swagger';
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Channel } from 'src/chat/entities/channel.entity';
import { User } from 'src/user/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

export type PunishmentType = 'ban' | 'mute';

export class PunishmentDto {
	@ApiProperty({
		description: 'the id of the punishment',
		example: 1,
	})
	id: number;

	@ApiProperty({
		description: 'the id of the channel',
		example: 1,
	})
	channelId: number;

	@ApiProperty({
		description: 'the punished user',
		type: User,
	})
	user: User;

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
		description: 'the date of the punishment',
		example: '2020-01-01T00:00:00.000Z',
	})
	duration?: Date;

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

	@ManyToOne((type) => Channel)
	channel: Channel;

	@Column({ nullable: true })
	reason?: string;

	@Column()
	type: PunishmentType;

	@Column({ nullable: true })
	duration?: Date;

	@Column()
	createdAt: Date;

	toDto(): PunishmentDto {
		return {
			id: this.id,
			channelId: this.channel.id,
			user: this.user,
			reason: this.reason,
			type: this.type,
			duration: this.duration,
			createdAt: this.createdAt,
		};
	}
}
