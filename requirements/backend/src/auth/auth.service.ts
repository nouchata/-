import { Injectable } from '@nestjs/common';
import { Session } from 'express-session';
import { Session2FaDTO } from 'src/tfa/dtos/session-2fa.dto';
import { User } from 'src/user/entities/user.entity';
import { UserInterface } from 'src/user/interface/UserInterface';
import { UserService } from 'src/user/user.service';
import { LoginState, StatusDTO } from './dtos/status.dto';
import { UserDetails } from './utils/UserDetails';

@Injectable()
export class AuthService {
	constructor (private userService: UserService) {}
	async validateUser(details: UserDetails): Promise<User> {
		let user = await this.userService.findUserByLogin(details.login);

		if (user)
			return (user);
		else
		{
			let createUser: UserInterface = {...details, role: 'user'};
			return (this.userService.createUser(createUser));
		}
	}

	status(req: any): StatusDTO
	{
		let isAuth : boolean = req.isAuthenticated();
		let status: StatusDTO = {
			loggedIn: LoginState.NOT_LOGGED
		};
		if (isAuth) {
			status.loggedIn = LoginState.LOGGED
			if ((req.session as Session & Session2FaDTO).twofa.needed
			&& !(req.session as Session & Session2FaDTO).twofa.passed)
				status.loggedIn = LoginState.PARTIAL;
		}
		if (status.loggedIn === LoginState.LOGGED)
			status.user = req.user;
		return (status);
	}
}
