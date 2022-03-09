import { Body, Controller, Inject, Post } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/user/entities/user.entity";
import { Repository } from "typeorm";
import { GameService } from "./game.service";
import { PlayerState } from "./types/PlayerState";

@Controller('game')
export class GameController {
	constructor(
		@InjectRepository(User) private userRepo: Repository<User>,
		@Inject(GameService) private gameService: GameService
	) {}

	@Post('match')
	createMatch(@Body() body: {
		winner: PlayerState,
		loser: PlayerState
	}) {
		return this.gameService.saveMatchResult(body.winner, body.loser);;
	}
}