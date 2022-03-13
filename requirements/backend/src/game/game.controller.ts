import { Body, Controller, Get, Inject, InternalServerErrorException, Param, ParseIntPipe, Post, Req, UseGuards } from "@nestjs/common";
import { ApiResponse } from "@nestjs/swagger";
import { GroupGuard } from "src/auth/guards/group.guard";
import { User } from "src/user/entities/user.entity";
import { GameService } from "./game.service";
import { GameOptions } from "./types/GameOptions";

@Controller('game')
export class GameController {
	constructor(
		@Inject(GameService) private gameService: GameService
	) {}

	@Post('join')
	@UseGuards(GroupGuard)
	@ApiResponse({
		status: 201,
		description: "Add the player to the matchmaking queue"
	})
 	startMatchmaking(@Req() req: { user: User }) {
		return this.gameService.matchmakingAddPlayer(req.user);
	}

	@Get('matchmaking/:id')
	@UseGuards(GroupGuard)
	@ApiResponse({
		status: 200,
		description: "Returns the match id if any, 0 otherwise"
	})
	@ApiResponse({
		status: 500,
		description: "Error while trying to create a new match"
	})
	getMatchmakingState(@Param('id', ParseIntPipe) id: number) {
		const matchId: number = this.gameService.matchmakingCheckMatch(id);
		if (matchId != -1)
			return matchId;
		throw new InternalServerErrorException("We can't match you with another player for now, try again later");
	}

	@Post('create')
	@UseGuards(GroupGuard)
	@ApiResponse({
		status: 201,
		description: "Create a private match with the parameters specified in the body"
	})
	createPrivateMatch(@Body() body: {
		ids: [number, number],
		options: Partial<GameOptions>
	}) {
		return this.gameService.createMatch(body.ids, body.options);
	}

}