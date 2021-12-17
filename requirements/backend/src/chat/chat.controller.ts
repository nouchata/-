import { Controller, Get, Post, Req } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';

@Controller('chat')
export class ChatController {
	constructor(
			@InjectRepository(User) private userRepo: Repository<User>) {}

}
