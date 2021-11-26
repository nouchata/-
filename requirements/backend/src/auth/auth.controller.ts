import { Controller, Get, Redirect, Req, UseGuards } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { FortyTwoGuard } from './guards/fortytwo.guard';
import { GroupGuard } from './guards/group.guard';
import { Roles } from './roles.decorator';

@Controller('auth')
export class AuthController {

   	@Get('login')
	@UseGuards(FortyTwoGuard)
	@ApiTags('auth')
	login() {
	}

	@Get('redirect')
	@UseGuards(FortyTwoGuard)
	@Redirect('/auth/status/', 301)
	@ApiTags('auth')
	redirect() {
	}

	@Get('status')
	@UseGuards(GroupGuard)
	@ApiTags('auth')
	status(@Req() req) {
		
		return req.user;
	}

	@Get('logout')
	@UseGuards(GroupGuard)
	@ApiTags('auth')
	logout(@Req() req) {
		req.session.destroy();
		return 'logged out';
	}
}
