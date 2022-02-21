import { Controller } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';

@Controller('chat')
export class ChatController {
	constructor(@InjectRepository(User) private userRepo: Repository<User>) {}
}
