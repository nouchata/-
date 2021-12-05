import { IsString, IsDate, IsArray, IsNumber, IsObject, ArrayContains, ValidateNested, IsBoolean } from "class-validator";
import { MatchHistoryDTO } from "./match-history.dto";

class GeneralInfo {
    @IsString()
    name: string;

    @IsString()
    picture: string;

    @IsString()
    role: string;

    @IsDate()
    creation: Date;
    
    @IsString()
    status: string;
}

class RankingInfo {
    @IsArray()
    vdRatio: [number, number];
    
    @IsNumber()
    elo: number;
    
    @IsNumber()
    rank: number;
}

export class FindUserDTO {

    constructor() {
        this.general = new GeneralInfo();
        this.ranking = new RankingInfo();
        this.history = [];
    }

    @ValidateNested()
    general: GeneralInfo;

    @ValidateNested()
    ranking: RankingInfo;

    @ValidateNested()
    history: MatchHistoryDTO[];

    @IsBoolean()
    isEditable: boolean;
}

