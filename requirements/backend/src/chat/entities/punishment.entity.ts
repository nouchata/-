/* eslint-disable @typescript-eslint/no-unused-vars */
import { Channel } from 'src/chat/entities/channel.entity';
import { User } from 'src/user/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

export type PunishmentType = 'ban' | 'mute';

@Entity({ name: 'punishements' })
export class Punishment {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne((type) => User)
	user: User;

	@ManyToOne((type) => Channel)
	channel: Channel;

	@Column({ nullable: true })
	reason: string;

	@Column()
	type: PunishmentType;

	@Column({ nullable: true })
	duration: Date;

	@Column()
	createdAt: Date;
}
