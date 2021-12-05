import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNumber, IsString } from "class-validator";

export class MatchHistoryDTO {

	@ApiProperty({description: "The winner's username", example: "mamartin"})
    @IsString()
    winner: string;

    @ApiProperty({description: "The loser's username", example: "tmatis"})
    @IsString()
    loser: string;

	@ApiProperty({description: 'An array with the score', example: "[5, 3]"})
    @IsArray()
    score: [number, number];

	@ApiProperty({description: 'The duration of the match in seconds', example: 300})
    @IsNumber()
    duration: number;
}
