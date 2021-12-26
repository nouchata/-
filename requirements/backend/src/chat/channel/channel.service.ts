import { Injectable, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateChannelDto } from '../dtos/create-channel.dto';
import { Channel } from '../entities/channel.entity';
import * as crypto from "crypto";
import { JoinChannelDto } from '../dtos/join-channel.dto';

@Injectable()
export class ChannelService {
	constructor(
		@InjectRepository(Channel) private channelRepository: Repository<Channel>
	) { }

	async createChannel(channel: CreateChannelDto & { owner: User }): Promise<Channel> {

		// check if we have the password for protected channels
		if (channel.channelType === 'protected') {
			if (!channel.password) {
				throw new HttpException('Request malformed', 400);
			}
		}

		let channelCreated = new Channel();

		if (channel.channelType === 'protected') {
			// generate salt
			const salt = crypto.randomBytes(16).toString('hex');
			// generate hash
			const hash = crypto.pbkdf2Sync(channel.password, salt, 1000, 64, 'sha512').toString('hex');
			channelCreated.password_hash = hash;
			channelCreated.password_salt = salt;
		}
		channelCreated.name = channel.name;
		channelCreated.channelType = channel.channelType;
		channelCreated.owner = channel.owner;
		channelCreated.users = [channel.owner];
		channelCreated.admins = [];
		channelCreated.messages = [];
		const newChannel: Channel = this.channelRepository.create(channelCreated);
		return this.channelRepository.save(newChannel);
	}

	async getChannel(channelId: number): Promise<Channel> {
		return this.channelRepository.findOne(channelId, { relations: ['owner', 'users'] });
	}

	async joinChannel(channel: JoinChannelDto, user: User): Promise<Channel> {
		
		const channelToJoin: Channel = await this.channelRepository.findOne(channel.id, { relations: ['users'] });
		
		if (!channelToJoin) {
			throw new HttpException('Channel not found', 404);
		}
		
		if (channelToJoin.channelType === 'protected') {
			const hash = crypto.pbkdf2Sync(channel.password, channelToJoin.password_salt, 1000, 64, 'sha512').toString('hex');
			if (hash !== channelToJoin.password_hash) {
				throw new HttpException('Wrong password', 401);
			}
		}

		if (channelToJoin.users.some(u => u.id === user.id)) {
			throw new HttpException('User already in channel', 400);
		}

		channelToJoin.users.push(user);
		return this.channelRepository.save(channelToJoin);
	}

}
