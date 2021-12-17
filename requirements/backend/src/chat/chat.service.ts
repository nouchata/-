import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';

@Injectable()
export class ChatService {
	constructor(@InjectRepository(Message) private msgRepo: Repository<Message>) {}

	async addMessage(msg: Partial<Message>) {
		return await this.msgRepo.save(msg);
	}
}
