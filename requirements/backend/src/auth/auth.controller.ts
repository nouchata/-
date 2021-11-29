import { Controller, Get, Redirect, Req, UseGuards } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { StatusDTO } from './dtos/status.dto';
import { FortyTwoGuard } from './guards/fortytwo.guard';
import { GroupGuard } from './guards/group.guard';

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService ) {}

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
	@ApiTags('auth')
	@ApiResponse({
		status: 200,
		description: 'User status',
		type: StatusDTO,
	})
	status(@Req() req): StatusDTO {
		return (this.authService.status(req))
	}

	@Get('logout')
	@UseGuards(GroupGuard)
	@ApiTags('auth')
	logout(@Req() req) {
		req.session.destroy();
		return 'logged out';
	}
}
