import { Controller, Get, UseGuards } from '@nestjs/common';
import { FortyTwoGuard } from './fortytwo.guard';

@Controller('auth')
export class AuthController {

   	@Get('login')
	@UseGuards(FortyTwoGuard)
	login() {
	}

	@Get('redirect')
	@UseGuards(FortyTwoGuard)
	redirect() {
	}

	@Get('status')
	status() {
	}

	@Get('logout')
	logout() {
	}
}
