import { Controller, Get, Redirect, Req, UseGuards } from '@nestjs/common';
import { FortyTwoGuard } from './guards/fortytwo.guard';
import { GroupGuard } from './guards/group.guard';
import { Roles } from './roles.decorator';

@Controller('auth')
export class AuthController {

   	@Get('login')
	@UseGuards(FortyTwoGuard)
	login() {
	}

	@Get('redirect')
	@UseGuards(FortyTwoGuard)
	@Redirect('/auth/status/', 301)
	redirect() {
	}

	@Get('status')
	@UseGuards(GroupGuard)
	status(@Req() req) {
		
		return req.user;
	}

	@Get('logout')
	@UseGuards(GroupGuard)
	logout(@Req() req) {
		req.session.destroy();
		return 'logged out';
	}
}
