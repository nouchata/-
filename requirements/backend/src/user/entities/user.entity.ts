import { ApiProperty } from "@nestjs/swagger";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";
import { UserInterface, UserRole } from "../interface/UserInterface";

@Entity({ name: 'users' })
export class User implements UserInterface {
	@PrimaryGeneratedColumn()
	@ApiProperty(
		{
			description: "id in the database",
			example: 50,
		}
	)
	id: number;

	@Column({
		unique: true,
	})
	@ApiProperty(
		{
			description: "The login of the user",
			example: "tmatis",
		}
	)
	login: string;

	@Column()
	@ApiProperty(
		{
			enum: ['standard', 'moderator', 'admin'],
			description: "The role of the user",
			example: "standard",
		}
	)
	role: UserRole;

	
	@CreateDateColumn(
		{
			update: false
		}
	)
	@ApiProperty(
		{
			description: "The date of creation of the user",
			example: 10000000000,
		}
	)
	createdAt: Date;
}
