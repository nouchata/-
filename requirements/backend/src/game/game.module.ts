import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "src/user/entities/user.entity";
import { GameController } from "./game.controller";
import { GameGateway } from "./game.gateway";

@Module({
	imports: [TypeOrmModule.forFeature([User])],
	controllers: [GameController],
	providers: [GameGateway]
})
export class GameModule { }