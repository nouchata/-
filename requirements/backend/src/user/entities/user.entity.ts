import { ApiProperty } from "@nestjs/swagger";
import { Column, PrimaryGeneratedColumn } from "typeorm";
import { UserInterface, UserRole } from "../interface/UserInterface";

export class User implements UserInterface
{
	@PrimaryGeneratedColumn()
	@ApiProperty(
		{
			description: "id in the database",
			example: 50,
			required: true,
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
			required: true,
		}
	)
	login: string;

	@Column()
	@ApiProperty(
		{
			enum: ['standard', 'moderator', 'admin'],
			description: "The role of the user",
			example: "standard",
			required: true,
		}
	)
	role: UserRole;
}
