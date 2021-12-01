import { Body, Controller, Get, HttpException, HttpStatus, Inject, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common'
import { ApiParam, ApiProperty, ApiResponse } from '@nestjs/swagger';
import { GroupGuard } from 'src/auth/guards/group.guard';
import { FindUsersByLoginDTO } from './dto/find-users-by-login.dto';
import { User } from './entities/user.entity';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
	constructor(@Inject(UserService) private userService: UserService) { }

	@ApiResponse({
		type: User,
		status: 200,
		description: 'the user found'
	})
	@ApiResponse({
		status: 404,
		description: 'No id matching user'
	})
	@UseGuards(GroupGuard)
	@Get(':id')
	async getUserByID(@Param('id', ParseIntPipe) id: number): Promise<User> {
		const userDB: User = await this.userService.getUserById(id);

		if (userDB)
			return (userDB);
		else
			throw new HttpException('Not found', HttpStatus.NOT_FOUND);
	}

	@ApiResponse({
		type: [User],
		status: 200,
		description: 'table of users that are matching login'
	})
	@ApiResponse({
		status: 404,
		description: 'No login matching'
	})
	@UseGuards(GroupGuard)
	@Post('search/login')
	async findUsersByLogin(@Body() findUserByLogin: FindUsersByLoginDTO): Promise<User[]>
	{
		let users: User[] = await this.userService.findUsersByLogin(findUserByLogin.loginfragment);

		if (users.length > 0)
			return (users.slice((findUserByLogin.offset - 1) * findUserByLogin.maxresults,
							findUserByLogin.offset * findUserByLogin.maxresults));
		else
			throw new HttpException('Not found', HttpStatus.NOT_FOUND);
	}
}
