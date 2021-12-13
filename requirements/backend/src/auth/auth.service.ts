import { Injectable } from '@nestjs/common';
import { User } from 'src/user/entities/user.entity';
import { UserInterface } from 'src/user/interface/UserInterface';
import { UserService } from 'src/user/user.service';
import { StatusDTO } from './dtos/status.dto';
import { UserDetails } from './utils/UserDetails';

@Injectable()
export class AuthService {
	constructor (private userService: UserService) {}
	async validateUser(details: UserDetails): Promise<User> {
		let user: User = await this.userService.findUserByLogin(details.login);

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
		let status: StatusDTO = {
			loggedIn: req.isAuthenticated(),
		};
		if (status.loggedIn)
			status.user = req.user;
		return (status);
	}
}
