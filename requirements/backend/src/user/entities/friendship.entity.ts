import { ApiProperty } from "@nestjs/swagger";
import { Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { User } from "./user.entity";

@Entity({ name: 'friendships' })
export class Friendship {
    
    @ApiProperty(
		{
			description: "The id of the first friend",
			example: 3,
		}
	)
	@PrimaryColumn()
	@ManyToOne(() => User, user => user.friends)
    id1: number;

    @ApiProperty(
		{
			description: "The id of the second friend",
			example: 7,
		}
	)
	@PrimaryColumn()
    id2: number;
}
