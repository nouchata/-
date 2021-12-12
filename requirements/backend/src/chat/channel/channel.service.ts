import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { ChannelType } from '../dtos/create-channel.dto';
import { Channel } from '../entities/channel.entity';

@Injectable()
export class ChannelService {
	constructor(
		@InjectRepository(Channel) private channelRepository: Repository<Channel>
		) {}
	
	async createChannel(channel: {name: string, channelType: ChannelType, owner: User}): Promise<Channel> {
		const newChannel: Channel = this.channelRepository.create({...channel, users: [channel.owner], messages: []});
		return this.channelRepository.save(newChannel);
	}

}
