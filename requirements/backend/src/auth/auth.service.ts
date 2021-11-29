import { Injectable } from '@nestjs/common';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { StatusDTO } from './dtos/status.dto';
import { UserDetails } from './utils/UserDetails';

@Injectable()
export class AuthService {
	constructor (private userService: UserService) {}
	async validateUser(details: UserDetails): Promise<User> {

		const { login } = details;

		let user: User = await this.userService.findUser({login});
		if (user)
			return (user);
		else
			return (this.userService.createUser({login, role: 'standard'}));
	}

	status(req: any): StatusDTO
	{
		let status: StatusDTO = {
			loggedIn: req.isAuthenticated(),
		};
		if (status.loggedIn)
		{
			status.login = req.user.login;
			status.role = req.user.role;
		}
		return (status);
	}
}
