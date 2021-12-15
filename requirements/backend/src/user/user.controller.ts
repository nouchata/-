import { GroupGuard } from 'src/auth/guards/group.guard';
import { EditUserDTO } from './dto/edit-user.dto';
import { Body, Controller, Get, HttpException, HttpStatus, Inject, NotFoundException, Param, ParseIntPipe, Patch, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common'
import { ApiResponse } from '@nestjs/swagger';
import { FindUsersByLoginDTO } from './dto/find-users-by-login.dto';
import { User } from './entities/user.entity';
import { UserService } from './user.service';
import { UpdateResult } from 'typeorm';
import { FindUserDTO } from './dto/find-user.dto';
import { UserChannelsDto } from './dto/user-channels.dto';

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
	@Get(':id')
	@UseGuards(GroupGuard)
	async getUserById(
		@Req() req: { user: User },
		@Param('id', ParseIntPipe) id: number
	): Promise<FindUserDTO> {
		const userDB = await this.userService.findUserById(id);
		const dto = await this.userService.createUserDTO(userDB);

		dto.isEditable = (req.user.id === id);
		return dto;
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
	async findUsersByLogin(@Body() findUserByLogin: FindUsersByLoginDTO): Promise<User[]> {
		let users: User[] = await this.userService.findUsersByLogin(findUserByLogin.loginfragment);

		if (users.length > 0)
			return (users.slice((findUserByLogin.offset - 1) * findUserByLogin.maxresults,
				findUserByLogin.offset * findUserByLogin.maxresults));
		else
			throw new HttpException('Not found', HttpStatus.NOT_FOUND);
	}

	@ApiResponse({
		type: UpdateResult,
		status: 200,
		description: 'the user found'
	})
	@ApiResponse({
		status: 401,
		description: 'Cannot edit a user other than yourself'
	})
	@ApiResponse({
		status: 404,
		description: 'No id matching user'
	})
	@Patch(':id')
	@UseGuards(GroupGuard)
	async editUserInfo(
		@Req() req: { user: User },
		@Param('id', ParseIntPipe) id: number,
		@Body() dto: EditUserDTO
	): Promise<UpdateResult> {
		if (req.user.id !== id) {
			throw new UnauthorizedException('A user can only edit their own profile.');
		}
		dto.id = id;
		return await this.userService.editUser(EditUserDTO.from(dto));
	}

	@Get('/:id/channels')
	@UseGuards(GroupGuard)
	@ApiResponse({
		type: [UserChannelsDto],
		status: 200,
		description: 'The channels were the is member user'
	})
	async getUserChannels(
		@Param('id', ParseIntPipe) id: number
	): Promise<UserChannelsDto[]> {
		return this.userService.getUserChannels({ id });
	}
}
