/* eslint-disable @typescript-eslint/no-unused-vars */
import { User } from 'src/user/entities/user.entity';
import {
	Column,
	CreateDateColumn,
	Entity,
	JoinTable,
	ManyToMany,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { ChannelType } from '../dtos/create-channel.dto';
import { ChannelDto, MessageDto } from '../dtos/user-channels.dto';
import { Message } from './message.entity';

@Entity({ name: 'channels' })
export class Channel {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	name: string;

	@Column()
	channelType: ChannelType;

	// optional column
	@Column({ nullable: true })
	password_hash: string;

	@Column({ nullable: true })
	password_salt: string;

	@ManyToOne((type) => User)
	owner: User;

	@ManyToMany((type) => User)
	@JoinTable()
	admins: User[];

	@ManyToMany((type) => User, (user) => user.channels, {
		onDelete: 'CASCADE',
	})
	users: User[];

	@OneToMany((type) => Message, (message) => message.channel, {
		onDelete: 'CASCADE',
	})
	messages: Message[];

	@CreateDateColumn()
	createdAt: Date;

	canUserAccess(user: User): boolean {
		return this.users.some((u) => u.id === user.id);
	}

	toDto(blockedUsers: User[]): ChannelDto {
		const channelDto: ChannelDto = {
			id: this.id,
			name: this.name,
			channelType: this.channelType,
			owner: this.owner.toDto(),
			users: this.users.map((user) => user.toDto()),
			admins: this.admins.map((u) => u.toDto()),
			messages: this.messages
				.filter((message) => {
					return !blockedUsers.find((user) => {
						return user.id === message.user?.id;
					});
				})
				.sort((a, b) => {
					return a.createdAt > b.createdAt ? 1 : -1;
				})
				.map((m) => m.toDto()),
		};
		return channelDto;
	}
}
