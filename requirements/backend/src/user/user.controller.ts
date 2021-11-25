import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { CreateUserDTO } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
	constructor(@Inject(UserService) private userService: UserService) {}

	@Post('add')
	@ApiResponse({
		status: 201,
		description: 'The user has been successfully created.',
		type: User})
	addUser(@Body() createUserDTO: CreateUserDTO) : Promise<User> {
		return this.userService.createUser(createUserDTO);
	}
}
