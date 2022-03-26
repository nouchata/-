/* eslint-disable @typescript-eslint/no-empty-function */
import { Controller, Get, Redirect, Req, UseGuards } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { Session } from 'express-session';
import { User } from 'src/user/entities/user.entity';
import { AuthService } from './auth.service';
import { StatusDTO } from './dtos/status.dto';
import { FortyTwoGuard } from './guards/fortytwo.guard';
import { GroupGuard } from './guards/group.guard';
import { OnlineStateGuard } from './guards/online-state.guard';

@UseGuards(OnlineStateGuard)
@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService) {}

	@Get('login')
	@UseGuards(FortyTwoGuard)
	@ApiTags('auth')
	login() {}

	@Get('redirect')
	@UseGuards(FortyTwoGuard)
	@Redirect('/auth/status/', 301)
	@ApiTags('auth')
	redirect() {}

	@Get('status')
	@ApiTags('auth')
	@ApiResponse({
		status: 200,
		description: 'User status',
		type: StatusDTO,
	})
	status(@Req() req: { user: User }): StatusDTO {
		return this.authService.status(req);
	}

	@Get('logout')
	@UseGuards(GroupGuard)
	@ApiTags('auth')
	logout(@Req() req: { session: Session }) {
		req.session.destroy(() => {});
		return 'logged out';
	}
}
