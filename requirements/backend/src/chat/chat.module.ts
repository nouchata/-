import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { Channel } from './entities/channel.entity';
import { Message } from './entities/message.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Message, Channel, User])],
	controllers: [ChatController],
	providers: [ChatService]
})
export class ChatModule { }
