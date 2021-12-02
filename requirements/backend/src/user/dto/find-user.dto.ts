import { Inject } from "@nestjs/common";
import { UserService } from '../user.service';
import { IsString, IsDate, IsArray, IsNumber, IsObject, ArrayContains, ValidateNested } from "class-validator";
import { User } from "../entities/user.entity";

class GeneralInfo {
    //@IsString()
    name: string;

    //@IsString()
    picture: string;

    //@IsString()
    role: string;

    //@IsDate()
    creation: Date;
    
    //@IsString()
    status: string;
}

class RankingInfo {
    //@IsArray()
    vdRatio: [number, number];
    
    //@IsNumber()
    elo: number;
    
    //@IsNumber()
    rank: number;
}

export class HistoryInfo {
    //@IsString()
    winner: string;
    
    //@IsString()
    loser: string;
    
    //@IsArray()
    score: [number, number];
    
    //@IsNumber()
    duration: number;
}

export class FindUserDTO {

    //@ValidateNested()
    general: GeneralInfo;

    //@ValidateNested()
    ranking: RankingInfo;

    //@ValidateNested()
    history: HistoryInfo[];
}

