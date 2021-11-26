import { Controller, Get } from '@nestjs/common';

@Controller('auth')
export class AuthController {

   	@Get('login')
	login() {
	}

	@Get('callback')
	callback() {
	}

	@Get('status')
	status() {
	}

	@Get('logout')
	logout() {
	}
}
