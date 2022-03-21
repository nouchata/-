import { ArrayMaxSize, ArrayMinSize, IsArray, IsNumber, IsObject, IsPositive, ValidateNested } from "class-validator";
import { GameOptions } from "../types/GameOptions";

export class PrivateMatchDTO {
    
    @IsArray()
    @IsNumber({}, { each: true })
    @IsPositive({ each: true })
    @ArrayMinSize(2)
    @ArrayMaxSize(2)
    ids: [number, number]

    @IsObject()
    options: Partial<GameOptions>
}