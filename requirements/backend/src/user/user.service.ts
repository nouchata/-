import { Injectable } from '@nestjs/common';
import { CreateUserDTO } from './dto/create-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
	
	createUser(user: CreateUserDTO) : User
	{
		let newUser: User = new User();

		newUser.id = 0;
		newUser.login = user.login;
		newUser.role = user.role;

		return newUser;
	}
}
