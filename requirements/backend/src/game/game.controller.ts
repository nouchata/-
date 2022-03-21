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
		if (this.gameService.getMatchId(req.user.id) !== 0) {
			throw new ForbiddenException('You already are in a match !');
		}
		this.gameService.matchmakingAddPlayer(req.user);
	}

	@Get('matchmaking')
	@UseGuards(GroupGuard)
	@ApiResponse({
		status: 200,
		description: "Returns the match id if any, 0 otherwise"
	})
	@ApiResponse({
		status: 500,
		description: "Error while trying to create a new match"
	})
	getMatchmakingState(@Req() req: { user: User }) {
		const response = this.gameService.checkMatch(req.user.id);

		if (response.error) {
			throw new InternalServerErrorException(response.error);
		}
		return response.id;
	}

	@Post('create')
	@UseGuards(GroupGuard)
	@ApiResponse({
		status: 201,
		description: "Create a private match with the parameters specified in the body"
	})
	async createPrivateMatch(@Body() body: PrivateMatchDTO) {
		
		const opt = new GameOptions(body.options);

		try {
			await validateOrReject(opt);
			if (opt.gameType !== 'standard' && opt.gameType !== 'extended') {
				throw new Error();
			}
		} catch (e) {
			throw new BadRequestException('Game options are not valid.');
	}

		try {
			return await this.gameService.createNewGame(body.ids, opt);
		} catch (e: any) {
			throw new InternalServerErrorException(e.message);
		}
	}
}