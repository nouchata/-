/* eslint-disable @typescript-eslint/no-unused-vars */
import { User } from 'src/user/entities/user.entity';
import {
	Column,
	CreateDateColumn,
	Entity,
	ManyToOne,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { MessageDto } from '../dtos/user-channels.dto';
import { Channel } from './channel.entity';

export type MessageType = 'user' | 'system' | 'invitation';

@Entity({ name: 'messages' })
export class Message {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	messageType: MessageType;

	@Column({ type: 'text' })
	text: string;

	@ManyToOne((type) => User, (user) => user.messages, { nullable: true })
	user?: User;

	@ManyToOne((type) => Channel, (channel) => channel.messages, {
		onDelete: 'CASCADE',
	})
	channel: Channel;

	@CreateDateColumn()
	createdAt: Date;

	toDto(): MessageDto {
		return {
			id: this.id,
			messageType: this.messageType,
			text: this.text,
			userId: this.user?.id,
		};
	}
}
