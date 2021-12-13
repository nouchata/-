import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsDate, IsArray, IsNumber, ValidateNested, IsBoolean } from "class-validator";
import { MatchHistoryDTO } from "./match-history.dto";

class GeneralInfo {

    @ApiProperty({
        description: "User's display name",
        example: "mamartin"
    })
    @IsString()
    name: string;

    @ApiProperty({
        description: "User's picture",
        example: "mamartin.jpg"
    })
    @IsString()
    picture: string;

    @ApiProperty({
		enum: ['user', 'moderator', 'admin'],
        description: "User's role",
        example: "user"
    })
    @IsString()
    role: string;

    @ApiProperty({
        description: "User's date of account creation",
        example: "2021-12-12 01:37:03.699864"
    })
    @IsDate()
    creation: Date;
    
    @ApiProperty({
		enum: ['online', 'offline', 'ingame'],
        description: "User's current status",
        example: "offline"
    })
    @IsString()
    status: string;
}

class RankingInfo {

	@ApiProperty({
        description: "Count of victories and losses",
        example: [78, 52]
    })
    @IsArray()
    vdRatio: [number, number];

    @ApiProperty({
        description: "Elo points of the user (useful for ladder purposes)",
        example: 1248
    })
    @IsNumber()
    elo: number;

    @ApiProperty({
        description: "User's rank in the ladder",
        example: 22
    })
    @IsNumber()
    rank: number;
}

export class FindUserDTO {

    constructor() {
        this.general = new GeneralInfo();
        this.ranking = new RankingInfo();
        this.history = [];
    }

	@ApiProperty({description: "General description of the user"})
    @ValidateNested()
    general: GeneralInfo;

	@ApiProperty({description: "Information about the user's ranking and victories/losses ratio"})
    @ValidateNested()
    ranking: RankingInfo;

	@ApiProperty({description: "Array with all the history of matches of the user"})
    @ValidateNested()
    history: MatchHistoryDTO[];

	@ApiProperty({description: "Needed to inform the frontend that the user logged in can edit these informations"})
    @IsBoolean()
    isEditable: boolean;
}

