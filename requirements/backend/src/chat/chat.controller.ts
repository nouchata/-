import { Controller, Get, Req } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';

@Controller('chat')
export class ChatController {
	constructor(
			@InjectRepository(Message) private msgRepo: Repository<Message>,
			@InjectRepository(User) private userRepo: Repository<User>) {}

	@Get('test')
	async test(@Req() req: any) {
		let user: User = req.user;
		let msg = new Message();
		msg.text = 'yolo';
		await this.msgRepo.save(msg);
		if (user.messages)
			user.messages.push(msg);
		else
			user.messages = [msg];
		await this.userRepo.save(user);
		return 'ok';
	}
}
