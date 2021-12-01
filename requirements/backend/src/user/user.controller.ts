import { Body, Controller, Get, Inject, Param, Patch, Req, UnauthorizedException, UseGuards } from '@nestjs/common'
import { GroupGuard } from 'src/auth/guards/group.guard';
import { EditUserDTO } from './dtos/edit-user.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
	constructor(@Inject(UserService) private userService: UserService) {}

	@Get(':id')
	async getUserInfo(@Param('id') id: number) {

		return await this.userService.findUserById(id);
	}

	@Patch(':id')
	@UseGuards(GroupGuard)
	async editUserInfo(
		@Req() request: any,
		@Param('id') id: number,
		@Body() dto: EditUserDTO
	) {
		if (request.user.id !== id) {
			throw new UnauthorizedException('A user can only edit their own profile.');
		}

		dto.id = id;
		return await this.userService.editUser(EditUserDTO.from(dto));
	}

}
