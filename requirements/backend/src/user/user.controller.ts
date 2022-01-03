import { GroupGuard } from 'src/auth/guards/group.guard';
import { EditUserDTO } from './dto/edit-user.dto';
import { Body, Controller, Get, HttpException, HttpStatus, Inject, Param, ParseIntPipe, Post, Req, UnsupportedMediaTypeException, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common'
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

@Controller('user')
export class UserController {
	constructor(@Inject(UserService) private userService: UserService) { }

	@ApiResponse({
		type: FindUserDTO,
		status: 200,
		description: 'The user found'
	})
	@ApiResponse({
		status: 404,
		description: 'No id matching user'
	})
	@Get(':id')
	@UseGuards(GroupGuard)
	async getUserById(
		@Req() req: any,
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
		description: 'Table of users that are matching login'
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

	@ApiResponse({
		type: User,
		status: 200,
		description: 'The user found'
	})
	@ApiResponse({
		status: 403,
		description: 'A user can only edit their own informations'
	})
	@ApiResponse({
		status: 404,
		description: 'No id matching user'
	})
	@Post('edit/')
	@UseGuards(GroupGuard)
	@UseInterceptors(FileInterceptor('picture', {
		storage: diskStorage({
			destination: 'public',
			filename: (req, file, cb) => {
				const extension: string = path.parse(file.originalname).ext;
				cb(null, `${uuidv4()}${extension}`);
			}
		}),
		limits: {
			files: 1,
			fileSize: 5000000 // 5MB
		}, 
		fileFilter: (req, file, cb) => {
			if (file.mimetype.startsWith('image/')) {
				cb(null, true);
			} else {
				cb(null, false); // reject the file
			}
		}
	}))
	async uploadFile(
		@Req() req,
		@Body() body: { username: string },
		@UploadedFile() file?: Express.Multer.File,
	) : Promise<User>
	{
		const dto = EditUserDTO.from({
			id: req.user.id,
			displayName: body.username,
			picture: file ? file.filename : undefined
		})

		const prevUser = await this.userService.findUserById(req.user.id);
		const newUser = await this.userService.editUser(dto);

		// delete the user's previous picture
		if (prevUser.picture !== newUser.picture) {
			fs.unlink('public/' + prevUser.picture, (err) => {
				if (err) {
					throw err;
				}
			})
		}
		return newUser;
	}
}
