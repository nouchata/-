import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";

export class LadderDTO {

    @ApiProperty({description: "The user's id", example: "57"})
    @IsNumber()
    id: number;

	@ApiProperty({description: "The user's display name", example: "mamartin"})
    @IsString()
    displayName: string;

    @ApiProperty({description: "The user's elo score", example: "1200"})
    @IsNumber()
    elo: number;
}
