import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { User } from './entities/user.entity';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
	constructor(@Inject(UserService) private userService: UserService) {}
}
