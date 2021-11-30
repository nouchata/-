import { ApiProperty } from "@nestjs/swagger";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";
import { UserInterface, UserRole, UserState } from "../interface/UserInterface";

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
			description: "The path to the avatar of the user",
			example: "avatar_16.jpg",
		}
	)
	avatar: string;

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

	@Column()
	@ApiProperty(
		{
			description: "The user's rank in the ladder",
			exemple: 598,
		}
	)
	rank: number;

	@Column("simple-array")
	@ApiProperty(
		{
			description: "The count of victories/losses of the user",
			exemple: [22, 13],
		}
	)
	vdRatio: [number, number];

	@Column("simple-array")
	@ApiProperty(
		{
			description: "The history of the previous matches of the user",
			exemple: [{ players: [56, 22], score: [5, 3], duration: 300 }],
		}
	)
	history: UserMatchHistory[];

	@Column("simple-array")
	@ApiProperty(
		{
			description: "The user's friends list (only contains user's id)",
			exemple: [18, 12, 27],
		}
	)
	friends: number[];

	@Column()
	@ApiProperty(
		{
			description: "The state of the user",
			exemple: "online",
		}
	)
	state: UserState;

	hasRole(role: UserRole): boolean {
		console.log(role);
		const roles_table: UserRole[] = ['standard', 'moderator', 'admin'];
		return (roles_table.indexOf(role) <= roles_table.indexOf(this.role));
	}
}
