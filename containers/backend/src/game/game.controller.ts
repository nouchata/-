import { BadRequestException, Body, ConflictException, Controller, Get, HttpCode, HttpStatus, Inject, InternalServerErrorException, Param, ParseIntPipe, Post, Req, UseGuards } from "@nestjs/common";
import { ApiResponse } from "@nestjs/swagger";
import { validateOrReject } from "class-validator";
import { GroupGuard } from "src/auth/guards/group.guard";
import { OnlineStateGuard } from "src/auth/guards/online-state.guard";
import { User } from "src/user/entities/user.entity";
import { PrivateMatchDTO } from "./dto/PrivateMatch.dto";
import { GameService } from "./game.service";
import { GameOptions } from "./types/GameOptions";

@Controller('game')
@UseGuards(GroupGuard)
@UseGuards(OnlineStateGuard)
export class GameController { 
	constructor(
		@Inject(GameService) private gameService: GameService,
	) {}

	@Post('join')
	
	@ApiResponse({
		status: 201,
		description: "Add the player to the matchmaking queue"
	})
 	startMatchmaking(@Req() req: { user: User }) {
		const matchId = this.gameService.getMatchId(req.user.id);
		if (matchId)
			return (matchId);
		
		this.gameService.matchmakingAddPlayer(req.user);
		return (0);
	}

	@Post('leave')
	@HttpCode(HttpStatus.ACCEPTED)
	@ApiResponse({
		status: 202,
		description: "Remove the player from the matchmaking queue, do nothing if the player is not there"
	})
 	leaveMatchmaking(@Req() req: { user: User }) {
		this.gameService.matchmakingRemovePlayer(req.user.id);
	}

	@Get('match')
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
			return await this.gameService.createNewGame(body.ids, opt, true);
		} catch (e: any) {
			throw new InternalServerErrorException(e.message);
		}
	}

	@Get('state/:id')
	getInstanceState(@Param('id', ParseIntPipe) id: number) {
		return (this.gameService.instanceStateRetriever(id));
	}
}