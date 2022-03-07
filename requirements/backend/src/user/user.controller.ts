import { GroupGuard } from 'src/auth/guards/group.guard';
import { EditUserDTO } from './dto/edit-user.dto';
import {
	Body,
	ConflictException,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpException,
	HttpStatus,
	NotFoundException,
	Param,
	ParseIntPipe,
	Post,
	Req,
	UploadedFile,
	UseFilters,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { FindUsersByLoginDTO } from './dto/find-users-by-login.dto';
import { User } from './entities/user.entity';
import { UserService } from './user.service';
import { FindUserDTO } from './dto/find-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { v4 as uuidv4 } from 'uuid';
import { diskStorage } from 'multer';
import path = require('path');
import fs = require('fs');
import { ChannelDto } from 'src/chat/dtos/user-channels.dto';
import { QueryExceptionFilter } from './utils/QueryExceptionFilter';
import { LadderDTO } from './dto/ladder.dto';
import { FriendDTO } from './dto/friend.dto';

@Controller('user')
export class UserController {
	constructor(private userService: UserService) {}

	@Get('ladder')
	@UseGuards(GroupGuard)
	@ApiResponse({
		type: [LadderDTO],
		status: 200,
		description: 'All the users, sorted by descending elo',
	})
	async getLadder(): Promise<LadderDTO[]> {
		const dto = await this.userService.createLadderDTO();
		return dto;
	}

	@ApiResponse({
		type: FindUserDTO,
		status: 200,
		description: 'The user found',
	})
	@ApiResponse({
		status: 404,
		description: 'No id matching user',
	})
	@Get(':id')
	@UseGuards(GroupGuard)
	async getUserById(
		@Req() req: any,
		@Param('id', ParseIntPipe) id: number
	): Promise<FindUserDTO> {
		const userDB = await this.userService.findUserById(id);
		if (!userDB) {
			throw new NotFoundException(
				`"${req.user.displayName}" is not an existing user.`
			);
		}

		const dto = await this.userService.createUserDTO(userDB);
		dto.isEditable = req.user?.id === id;
		return dto;
	}

	@ApiResponse({
		type: [User],
		status: 200,
		description: 'Table of users that are matching login',
	})
	@ApiResponse({
		status: 404,
		description: 'No login matching',
	})
	@UseGuards(GroupGuard)
	@Post('search/login')
	async findUsersByLogin(
		@Body() findUserByLogin: FindUsersByLoginDTO
	): Promise<User[]> {
		const users: User[] = await this.userService.findUsersByLogin(
			findUserByLogin.loginfragment
		);

		if (users.length > 0)
			return users.slice(
				(findUserByLogin.offset - 1) * findUserByLogin.maxresults,
				findUserByLogin.offset * findUserByLogin.maxresults
			);
		else throw new HttpException('Not found', HttpStatus.NOT_FOUND);
	}

	@ApiResponse({
		type: User,
		status: 200,
		description: 'The user found',
	})
	@ApiResponse({
		status: 403,
		description: 'A user can only edit their own informations',
	})
	@ApiResponse({
		status: 404,
		description: 'No id matching user',
	})
	@Post('edit/')
	@UseFilters(QueryExceptionFilter)
	@UseGuards(GroupGuard)
	@UseInterceptors(
		FileInterceptor('picture', {
			storage: diskStorage({
				destination: 'public',
				filename: (req, file, cb) => {
					const extension: string = path.parse(file.originalname).ext;
					cb(null, `${uuidv4()}${extension}`);
				},
			}),
			limits: {
				files: 1,
				fileSize: 5000000, // 5MB
			},
			fileFilter: (req, file, cb) => {
				if (file.mimetype.startsWith('image/')) {
					cb(null, true);
				} else {
					cb(null, false); // reject the file
				}
			},
		})
	)
	async uploadFile(
		@Req() req: { user: User },
		@Body() body: { username: string; twofa: string },
		@UploadedFile() file?: Express.Multer.File
	): Promise<User> {
		const dto: EditUserDTO = new EditUserDTO();
		dto.id = req.user.id;
		if (body.username) dto.displayName = body.username;
		if (file) dto.picture = file.filename;
		if (body.twofa) dto.twofa = body.twofa === 'true' ? true : false;

		const prevUser = await this.userService.findUserById(dto.id);
		if (!prevUser) {
			throw new NotFoundException(
				`"${req.user.displayName}" is not an existing user.`
			);
		}
		const newUser = await this.userService.editUser(dto, prevUser.picture);

		// delete the user's previous picture
		if (prevUser.picture !== newUser.picture) {
			fs.unlink('public/' + prevUser.picture, (err) => {
				if (err) {
					throw err;
				}
			});
		}
		return newUser;
	}

	@Get('channels/list')
	@UseGuards(GroupGuard)
	@ApiResponse({
		type: [ChannelDto],
		status: 200,
		description: 'The channels were the is member user',
	})
	async getUserChannels(@Req() req: { user: User }): Promise<ChannelDto[]> {
		return this.userService.getUserChannels({ id: req.user.id });
	}

	@Post('block/:id')
	@UseGuards(GroupGuard)
	@ApiResponse({
		status: 200,
		description: 'The user was blocked',
	})
	@ApiResponse({
		status: 404,
		description: 'No id matching user',
	})
	async blockUser(
		@Req() req: { user: User },
		@Param('id', ParseIntPipe) id: number
	) {
		return this.userService.blockUser(
			req.user,
			await this.userService.findUserById(id)
		);
	}

	@Get('block/list')
	@UseGuards(GroupGuard)
	@ApiResponse({
		type: [User],
		status: 200,
		description: 'The users that are blocked',
	})
	async getBlockedUsers(@Req() req: { user: User }): Promise<User[]> {
		return this.userService.getBlockedUsers(req.user);
	}

	@Get('friends/list')
	@UseGuards(GroupGuard)
	@ApiResponse({
		type: [FriendDTO],
		status: 200,
		description: "The list of all the user's friends",
	})
	async getFriendslistDTO(@Req() req: { user: User }): Promise<FriendDTO[]> {
		const list = await this.userService.getFriendslist(req.user.id);
		return list.map((friend) => {
			return FriendDTO.fromEntity(friend);
		});
	}

	@Post('friends/add')
	@UseGuards(GroupGuard)
	@ApiResponse({
		status: 201,
		description: 'Add the specified user as friend',
	})
	@ApiResponse({
		status: 404,
		description: 'User does not exist',
	})
	@ApiResponse({
		status: 409,
		description: 'Already friend with this user',
	})
	async addFriend(
		@Req() req: { user: User },
		@Body() body: { username: string }
	): Promise<FriendDTO> {
		const friend = await this.userService.findUserByDisplayName(
			body.username
		); // find friend's entity
		if (!friend) {
			throw new NotFoundException(
				`"${body.username}" is not an existing user.`
			);
		}

		return this.userService.editFriendship(
			req.user,
			friend,
			(user: User, friend: User, index: number) => {
				if (index !== -1) {
					throw new ConflictException(
						`"${friend.displayName}" and you are already friends.`
					);
				} else if (user.id === friend.id) {
					throw new ConflictException(`You cannot add yourself !`);
				}
				user.friends.push(friend);
				return user;
			}
		);
	}

	@Delete('friends/delete/:name')
	@HttpCode(HttpStatus.NO_CONTENT)
	@UseGuards(GroupGuard)
	@ApiResponse({
		status: 200,
		description: 'Delete an user from your friends list',
	})
	@ApiResponse({
		status: 404,
		description: 'User does not exist',
	})
	@ApiResponse({
		status: 409,
		description: 'User is not your friend',
	})
	async deleteFriend(
		@Req() req: { user: User },
		@Param('name') username: string
	) {
		const friend = await this.userService.findUserByDisplayName(username); // find friend's entity
		if (!friend) {
			throw new NotFoundException(
				`"${username}" is not an existing user.`
			);
		}

		this.userService.editFriendship(
			req.user,
			friend,
			(user: User, friend: User, index: number) => {
				if (index === -1) {
					throw new ConflictException(
						`${friend.displayName} is not your friend.`
					);
				}
				user.friends.splice(index, 1);
				return user;
			}
		);
	}
}
