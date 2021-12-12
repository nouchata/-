import { User } from "src/user/entities/user.entity";
import { Column, Entity, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
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

	@ManyToOne(type => User)
	owner: User;

	@ManyToMany(type => User, user => user.channels)
	users: User[];

	@OneToMany(type => Message, message => message.channel)
	messages: Message[];

	canUserAccess(user: User): boolean {
		return this.users.some(u => u.id === user.id);
	}
}
