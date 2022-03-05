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
	@ApiPropertyOptional({
		description: 'The email of the user',
		example: 'tmatis@student.42.fr',
	})
	email?: string;

	@CreateDateColumn({
		update: false,
	})
	@ApiProperty({
		description: 'The date of creation of the user',
		example: '2021-12-01T17:45:40.162Z',
	})
	createdAt: Date;

	@Column({
		type: 'int',
		default: 1000,
	})
	@ApiProperty({
		description: "The user's elo score to determine their ranking",
		example: 1450,
	})
	elo = 1000;

	@Column({
		default: 0,
	})
	@ApiProperty({
		description: 'The number of victories of the user',
		example: 22,
	})
	victories: number;

	@Column({
		default: 0,
	})
	@ApiProperty({
		description: 'The number of losses of the user',
		example: 13,
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
	@ApiProperty({
		description: "The user's friends list",
	})
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
	@ApiProperty({
		description: 'Toggled to true if the 2fa authentication is used',
	})
	twofa: boolean;

	@Column({
		default: true,
	})
	@ApiProperty({
		description: 'Filled if 2FA is enabled (16 chars)',
		example: 'OFUQCLIWNMOQ24BF',
	})
	twofa_secret: string;

	@ManyToMany((type) => User, (user) => user.blockedUsers)
	@JoinTable()
	@ApiProperty({
		description: 'The list of the user blocked',
		type: [User],
	})
	blockedUsers: User[];
}
