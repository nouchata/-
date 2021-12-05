import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'friendships' })
export class Friendship {
    
    @ApiProperty(
		{
			description: "The id of the friendship in the database",
			example: 25,
		}
	)
    @PrimaryGeneratedColumn()
    key: number;

    @ApiProperty(
		{
			description: "The id of the first friend",
			example: 3,
		}
	)
    @Column({
        unique: true,
        update: false
    })
    id1: number;

    @ApiProperty(
		{
			description: "The id of the other friend",
			example: 7,
		}
	)
    @Column({
        unique: true,
        update: false
    })
    id2: number;
}
