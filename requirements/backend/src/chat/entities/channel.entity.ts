import { User } from "src/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { ChannelType } from "../dtos/create-channel.dto";
import { Message } from "./message.entity";

@Entity({ name: "channels" })
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

	@ManyToOne(type => User)
	owner: User;

	@ManyToMany(type => User)
	@JoinTable()
	admins: User[];

	@ManyToMany(type => User, user => user.channels, { onDelete: 'CASCADE' })
	users: User[];

	@OneToMany(type => Message, message => message.channel, { onDelete: 'CASCADE' })
	messages: Message[];

	@CreateDateColumn()
	createdAt: Date;

	canUserAccess(user: User): boolean {
		return this.users.some(u => u.id === user.id);
	}
}
