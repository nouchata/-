import { User } from "src/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Channel } from "./channel.entity";

@Entity({ name: "messages" })
export class Message {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	text: string;
	
	@ManyToOne(type => User, user => user.messages)
	user: User;

	@ManyToOne(type => Channel, channel => channel.messages, { onDelete: 'CASCADE' })
	channel: Channel;

	@CreateDateColumn()
	createdAt: Date;

}
