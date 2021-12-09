import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { UserInterface, UserRole, UserStatus } from "../interface/UserInterface";
import { Friendship } from "./friendship.entity";
import { MatchHistory } from "./match-history.entity";

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
		default: 0,
	})
	@ApiProperty(
		{
			description: "The number of victories of the user",
			example: 22,
		}
	)
	victories: number;

	@Column({
		default: 0,
	})
	@ApiProperty(
		{
			description: "The number of losses of the user",
			example: 13,
		}
	)
	losses: number;

	@ManyToMany(type => MatchHistory, {
		eager: true
	})
	@JoinTable()
	@ApiProperty(
		{
			description: "The history of the previous matches of the user",
			example: "see MatchHistory documentation for further info",
		}
	)
	history: MatchHistory[];

	@OneToMany(() => Friendship, friendship => friendship.id1, {
		eager: true
	})
	@ApiProperty(
		{
			description: "The user's friends list",
		}
	)
	friends: Friendship[];

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
