/* eslint-disable @typescript-eslint/no-unused-vars */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Channel } from 'src/chat/entities/channel.entity';
import { Message } from 'src/chat/entities/message.entity';
import {
	Column,
	CreateDateColumn,
	Entity,
	JoinTable,
	ManyToMany,
	OneToMany,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { UserInterface, UserStatus } from '../interface/UserInterface';
import { MatchHistory } from './match-history.entity';

export class UserDto {
	@ApiProperty({
		description: 'id in the database',
		example: 50,
	})
	id: number;

	@ApiProperty({
		description: 'The login of the user',
		example: 'tmatis',
	})
	login: string;

	@ApiProperty({
		description: "The user's picture filename",
		example: 'tmatis.jpg',
	})
	picture: string;

	@ApiProperty({
		description: 'The display name of the user',
		example: 'Theo Matis',
	})
	displayName: string;

	@ApiPropertyOptional({
		description: 'The email of the user',
		example: 'tmatis@student.42.fr',
	})
	email?: string;

	@ApiProperty({
		description: 'The date of creation of the user',
		example: '2021-12-01T17:45:40.162Z',
	})
	createdAt: Date;

	@ApiProperty({
		description: "The user's elo score to determine their ranking",
		example: 1450,
	})
	elo: number;
	@ApiProperty({
		description: 'The number of victories of the user',
		example: 22,
	})
	victories: number;
	@ApiProperty({
		description: 'The history of the previous matches of the user',
	})
	history: MatchHistory[];

	@ApiProperty({
		description: 'The list of the user blocked',
		type: [UserDto],
	})
	blockedUsers: UserDto[];

	@ApiProperty({
		description: "The user's friends list",
		type: [UserDto],
	})
	friends: UserDto[];

	@ApiProperty({
		enum: ['online', 'offline', 'ingame'],
		description: 'The state of the user',
		example: 'online',
	})
	status: UserStatus;
}

@Entity({ name: 'users' })
export class User implements UserInterface {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({
		unique: true,
		update: false,
	})
	login: string;

	@Column({
		nullable: true,
	})
	picture: string;

	@Column({
		unique: true,
	})
	displayName: string;

	@Column({ nullable: true })
	email?: string;

	@CreateDateColumn({
		update: false,
	})
	createdAt: Date;

	@Column({
		type: 'int',
		default: 1000,
	})
	elo = 1000;

	@Column({
		default: 0,
	})
	victories: number;

	@Column({
		default: 0,
	})
	losses: number;

	@ManyToMany((type) => MatchHistory, { eager: true })
	@JoinTable()
	@ApiProperty({
		description: 'The history of the previous matches of the user',
	})
	history: MatchHistory[];

	@ManyToMany((type) => User)
	@JoinTable()
	friends: User[];

	@ManyToMany((type) => Channel, (channel) => channel.users, {
		onDelete: 'CASCADE',
	})
	@JoinTable()
	channels: Channel[];

	@OneToMany((type) => Message, (message) => message.user, {
		onDelete: 'CASCADE',
	})
	messages: Message[];

	@Column({
		default: true,
	})
	@ApiProperty({
		enum: ['online', 'offline', 'ingame'],
		description: 'The state of the user',
		example: 'online',
	})
	status: UserStatus;

	@Column({
		default: false,
	})
	twofa: boolean;

	@Column({
		default: true,
	})
	twofa_secret: string;

	@ManyToMany((type) => User, {
		onDelete: 'CASCADE',
	})
	@JoinTable()
	blockedUsers: User[];

	toDto(): UserDto {
		const dto: UserDto = {
			id: this.id,
			login: this.login,
			picture: this.picture,
			displayName: this.displayName,
			email: this.email,
			createdAt: this.createdAt,
			elo: this.elo,
			victories: this.victories,
			history: this.history,
			friends: this.friends?.map((friend) => friend.toDto()),
			status: this.status,
			blockedUsers: this.blockedUsers?.map((user) => user.toDto()),
		};
		return dto;
	}
}
