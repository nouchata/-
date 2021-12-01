import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
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
			enum: ['user', 'moderator', 'admin'],
			description: "The role of the user",
			example: "user",
		}
	)
	role: UserRole;

	@Column()
	@ApiProperty(
		{
			description: "The display name of the user",
			example: "Theo Matis",
		}
	)
	displayName: string;

	@Column()
	@ApiProperty(
		{
			description: "The profile url of the user",
			example: "https://profile.intra.42.fr/users/tmatis",
		}
	)
	profileURL: string;

	@Column({nullable: true})
	@ApiPropertyOptional(
		{
			description: "The email of the user",
			example: "tmatis@student.42.fr",
		}
	)
	email?: string;

	@Column({nullable: true})
	@ApiPropertyOptional(
		{
			description: "The picture of the user",
			example: "https://cdn.intra.42.fr/users/tmatis.jpg",
		}
	)
	picture?: string;

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

	hasRole(role: UserRole): boolean {
		console.log(role);
		const roles_table: UserRole[] = ['user', 'moderator', 'admin'];
		return (roles_table.indexOf(role) <= roles_table.indexOf(this.role));
	}
}
