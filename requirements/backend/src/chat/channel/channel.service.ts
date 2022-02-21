import { MessageType } from './../entities/message.entity';
import { ChatGateway } from './../chat.gateway';
import { Injectable, HttpException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateChannelDto } from '../dtos/create-channel.dto';
import { Channel } from '../entities/channel.entity';
import * as crypto from "crypto";
import { JoinChannelDto } from '../dtos/join-channel.dto';
import { ChannelDto } from '../dtos/user-channels.dto';
import { Message } from '../entities/message.entity';

@Injectable()
export class ChannelService {
	constructor(
		@InjectRepository(Channel) private channelRepository: Repository<Channel>,
		@InjectRepository(Message) private messageRepository: Repository<Message>,
		@Inject(forwardRef(() => ChatGateway)) private chatGateway: ChatGateway
	) {}

	async createMessage(channel: Channel, messageType: MessageType, text: string, user?: User): Promise<Message> {
		// add info message
		const messageCreated: Message = new Message();
		messageCreated.channel = channel;
		messageCreated.messageType = messageType;
		messageCreated.text = text;
		messageCreated.user = user;
		const newMessage: Message = await this.messageRepository.save(this.messageRepository.create(messageCreated));
		return newMessage;
	}

	async sendMessage(message: Message): Promise<Channel> {
		const channel: Channel = message.channel;
		this.chatGateway.sendMessageToChannel(channel.id, message.toDto());
		channel.messages.push(message);
		return channel;
	}

	async createChannel(channel: CreateChannelDto & { owner: User }): Promise<ChannelDto> {

		// check if we have the password for protected channels
		if (channel.channelType === 'protected') {
			if (!channel.password) {
				throw new HttpException('Request malformed', 400);
			}
		}

		let channelCreated: Channel = new Channel();

		if (channel.channelType === 'protected') {
			if (!channel.password) {
				throw new HttpException('Request malformed', 400);
			}
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

		let newChannel: Channel = await this.channelRepository.save(this.channelRepository.create(channelCreated));
		
		newChannel.messages.push(await this.createMessage(
			newChannel,
			'system',
			`${channel.owner.displayName} created the channel`
			));

		return newChannel.toDto();
	}

	async getChannel(channelId: number) {
		return this.channelRepository.findOne(channelId, { relations: ['users', 'owner', 'admins', 'messages'] });
	}

	async getPublicChannels(): Promise<Channel[]> {
		return this.channelRepository.find({ where: { channelType: 'public' } });
	}

	async getProtectedChannels(): Promise<Channel[]> {
		return this.channelRepository.find({ where: { channelType: 'protected' } });
	}

	async joinChannel(channel: JoinChannelDto, user: User): Promise<ChannelDto> {
		
		let channelToJoin = await this.channelRepository.findOne(channel.id, { relations: ['users', 'owner', 'admins', 'messages'] });
		
		if (!channelToJoin) {
			throw new HttpException('Channel not found', 404);
		}

		if (channelToJoin.channelType === 'private') {
			throw new HttpException('This channel is private, you must be invited', 403);
		}
		
		if (channelToJoin.channelType === 'protected') {
			if (!channel.password) {
				throw new HttpException('Request malformed', 400);
			}
			const hash = crypto.pbkdf2Sync(channel.password, channelToJoin.password_salt, 1000, 64, 'sha512').toString('hex');
			if (hash !== channelToJoin.password_hash) {
				throw new HttpException('Wrong password', 401);
			}
		}

		if (channelToJoin.users.some(u => u.id === user.id)) {
			throw new HttpException('User already in channel', 400);
		}

		channelToJoin.users.push(user);
		channelToJoin = await this.sendMessage(await this.createMessage(
			channelToJoin,
			'system',
			`${user.displayName} joined the channel`,
		));
		return (await this.channelRepository.save(channelToJoin)).toDto();
	}

	async leaveChannel(channelId: number, user: User) {
		let channelToLeave = await this.channelRepository.findOne(channelId, { relations: ['users', 'admins', 'messages'] });
		if (!channelToLeave) {
			throw new HttpException('Channel not found', 404);
		}
		if (!channelToLeave.users.some(u => u.id === user.id)) {
			throw new HttpException('User not in channel', 400);
		}
		channelToLeave.users = channelToLeave.users.filter(u => u.id !== user.id);
		// add info message
		channelToLeave = await this.sendMessage(await this.createMessage(
			channelToLeave,
			'system',
			`${user.displayName} left the channel`
		));
		this.chatGateway.removeUserChannel(channelToLeave.id, user);


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
				channelToLeave = await this.sendMessage(await this.createMessage(
					channelToLeave,
					'system',
					`${channelToLeave.owner.displayName} is now the owner of the channel`
				));
			}
			this.channelRepository.save(channelToLeave);
		}
	}
}
