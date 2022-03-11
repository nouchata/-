import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Param, Post, Req } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/user/entities/user.entity";
import { Repository } from "typeorm";
import { GameService } from "./game.service";
import { TestUser } from "./types/Matchmaking";

@Controller('matchmaking')
export class GameController {
	constructor(
		@InjectRepository(User) private userRepo: Repository<User>,
		@Inject(GameService) private gameService: GameService
	) {}

	@Post('test')
	@HttpCode(HttpStatus.OK)
 	testNormalStartMatchmaking(@Body() body: TestUser) {
		return this.gameService.matchmakingAddPlayer(body);
	}

	// guard
	@Post('join')
	@HttpCode(HttpStatus.OK)
 	startMatchmaking(@Req() req: { user: User }) {
		return this.gameService.matchmakingAddPlayer(req.user);
	}

	// guard
	@Get('state/:id')
	getMatchmakingState(@Param('id') id: number) {
		const res = this.gameService.matchmakingCheckMatch(id);
		return res ? HttpStatus.OK : HttpStatus.NOT_FOUND;
	}
}