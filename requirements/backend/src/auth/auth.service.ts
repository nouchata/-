import { Injectable } from '@nestjs/common';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { UserDetails } from './utils/UserDetails';

@Injectable()
export class AuthService {
	constructor (private userService: UserService) {}
	async validateUser(details: UserDetails): Promise<User> {

		const { login } = details;

		let user: User = await this.userService.findUser({login});
		
		if (user)
			return (user);
			
		return (this.userService.createUser({login, role: 'standard'}));
	}

}
