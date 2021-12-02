import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";
import { UserInterface, UserMatchHistory, UserRole, UserStatus } from "../interface/UserInterface";

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
		update: false,
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
			description: "The path to the picture of the user",
			example: "https://cdn.intra.42.fr/users/tmatis.jpg",
		}
	)
	picture: string;

	@Column()
	@ApiProperty(
		{
			enum: ['user', 'moderator', 'admin'],
			description: "The role of the user",
			example: "user",
		}
	)
	role: UserRole;

	@Column({
		unique: true,
	})
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

	@CreateDateColumn(
		{
			update: false
		}
	)
	@ApiProperty(
		{
			description: "The date of creation of the user",
			example: '2021-12-01T17:45:40.162Z',
		}
	)
	createdAt: Date;

	@Column({
		type: 'int',
		default: 1000,
	})
	@ApiProperty(
		{
			description: "The user's elo score to determine their ranking",
			example: 1450,
		}
	)
	elo: number = 1000;

	@Column({
		type: "simple-array",
		default: true,
	})
	@ApiProperty(
		{
			description: "The count of victories/losses of the user",
			example: [22, 13],
		}
	)
	vdRatio: [number, number] = [0, 0];

	@Column({
		type: "simple-array",
		default: true,
	})
	@ApiProperty(
		{
			description: "The history of the previous matches of the user",
			example: [{ players: [56, 22], score: [5, 3], duration: 300 }],
		}
	)
	history: UserMatchHistory[] = [];

	@Column({
		type: "simple-array",
		default: true,
	})
	@ApiProperty(
		{
			description: "The user's friends list (only contains user's id)",
			example: [18, 12, 27],
		}
	)
	friends: number[] = [];

	@Column({
		default: true,
	})
	@ApiProperty(
		{
			description: "The state of the user",
			example: "online",
		}
	)
	status: UserStatus = 'online';

	hasRole(role: UserRole): boolean {
		console.log(role);
		const roles_table: UserRole[] = ['user', 'moderator', 'admin'];
		return (roles_table.indexOf(role) <= roles_table.indexOf(this.role));
	}
}
