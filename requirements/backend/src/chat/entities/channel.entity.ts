import { User } from "src/user/entities/user.entity";
import { Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Message } from "./message.entity";

@Entity({ name: "channels" })
export class Channel {

	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	name: string;

	@ManyToMany(type => User, user => user.channels)
	users: User[];

	@OneToMany(type => Message, message => message.channel)
	messages: Message[];
}
