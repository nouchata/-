import { Injectable, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateChannelDto } from '../dtos/create-channel.dto';
import { Channel } from '../entities/channel.entity';
import * as crypto from "crypto";
import { JoinChannelDto } from '../dtos/join-channel.dto';
import { ChannelDto } from '../dtos/user-channels.dto';

@Injectable()
export class ChannelService {
	constructor(
		@InjectRepository(Channel) private channelRepository: Repository<Channel>
	) { }

	async createChannel(channel: CreateChannelDto & { owner: User }): Promise<ChannelDto> {

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
		return (await this.channelRepository.save(newChannel)).toDto();
	}

	async getChannel(channelId: number): Promise<Channel> {
		return this.channelRepository.findOne(channelId, { relations: ['owner', 'users'] });
	}

	async joinChannel(channel: JoinChannelDto, user: User): Promise<ChannelDto> {
		
		const channelToJoin: Channel = await this.channelRepository.findOne(channel.id, { relations: ['users'] });
		
		if (!channelToJoin) {
			throw new HttpException('Channel not found', 404);
		}

		if (channelToJoin.channelType === 'private') {
			throw new HttpException('This channel is private, you must be invited', 403);
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
		return (await this.channelRepository.save(channelToJoin)).toDto();
	}

	async leaveChannel(channelId: number, user: User) {
		const channelToLeave: Channel = await this.channelRepository.findOne(channelId, { relations: ['users'] });
		if (!channelToLeave) {
			throw new HttpException('Channel not found', 404);
		}
		if (!channelToLeave.users.some(u => u.id === user.id)) {
			throw new HttpException('User not in channel', 400);
		}
		channelToLeave.users = channelToLeave.users.filter(u => u.id !== user.id);
		// check if channel is empty
		if (channelToLeave.users.length === 0) {
			// cascade delete
			this.channelRepository.delete(channelToLeave.id);
		} else {
			// remove user in case he is admin
			channelToLeave.admins = channelToLeave.admins.filter(u => u.id !== user.id);

			// is user is owner, set new owner from admin
			// is no admin left, choose new owner from users
			if (channelToLeave.owner.id === user.id) {
				if (channelToLeave.admins.length > 0) {
					channelToLeave.owner = channelToLeave.admins[0];
				} else {
					channelToLeave.owner = channelToLeave.users[0];
				}
			}
			this.channelRepository.save(channelToLeave);
		}
	}
}
