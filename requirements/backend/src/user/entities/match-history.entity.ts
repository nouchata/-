import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'match_histories' })
export class MatchHistory {
    
    @ApiProperty({
		description: "The id of the match in the database",
		example: 3,
	})
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({
		description: "The id of the winner",
		example: 26,
	})
    @Column({
        update: false
    })
    winnerId: number;

    @ApiProperty({
		description: "The id of the loser",
		example: 32,})
    @Column({
        update: false
    })
    loserId: number;

    @ApiProperty({
		description: "The winner's score",
		example: 5,
	})
    @Column({
        update: false
    })
    winScore: number;

    @ApiProperty({
		description: "The loser's score",
		example: 2,
	})
    @Column({
        update: false
    })
    loseScore: number;

    @ApiProperty({
		description: "The duration of the match in seconds",
		example: 300,
	})
    @Column({
        update: false
    })
    duration: number;

	@ApiProperty({
		description: "The date when the match began",
		example: '2021-12-01T17:45:40.162Z',
	})
    @Column({
        update: false
    })
    date: Date;
}
