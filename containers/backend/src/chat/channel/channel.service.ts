import {
	DirectChannel,
	GroupChannel,
	IChannel,
	ProtectedChannel,
} from './../entities/channel.entity';
import { PunishmentType } from './../entities/punishment.entity';
import { MessageType } from './../entities/message.entity';
import { ChatGateway } from './../chat.gateway';
import { Injectable, HttpException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateChannelDto } from '../dtos/create-channel.dto';
import { Channel } from '../entities/channel.entity';
import * as crypto from 'crypto';
import { JoinChannelDto } from '../dtos/join-channel.dto';
import { ChannelDto } from '../dtos/user-channels.dto';
import { Message } from '../entities/message.entity';
import { UserService } from 'src/user/user.service';
import { CreatePunishmentDto } from '../dtos/create-punishment.dto';
import { Punishment } from '../entities/punishment.entity';
import { EditChannelDto } from '../dtos/edit-channel.dto';

@Injectable()
export class ChannelService {
	constructor(
		@InjectRepository(Channel)
		private channelRepository: Repository<Channel>,
		@InjectRepository(Message)
		private messageRepository: Repository<Message>,
		@InjectRepository(Punishment)
		private punishmentRepository: Repository<Punishment>,
		@Inject(forwardRef(() => ChatGateway)) private chatGateway: ChatGateway,
		private userService: UserService
	) {
		this.messageRepository
			.find({
				where: {
					messageType: 'invitation',
				},
			})
			.then(async (messages) => {
				this.messageRepository.remove(messages);
			});
	}

	async getChannel(
		channelId: number,
		relations?: string[]
	): Promise<IChannel | undefined> {
		const defaultRelations = [
			'users',
			'owner',
			'admins',
			'messages',
			'messages.user',
			'punishments',
			'punishments.user',
		];
		return this.channelRepository.findOne(channelId, {
			relations: relations || defaultRelations,
		}) as Promise<IChannel | undefined>;
	}

	async createMessage(
		channel: IChannel | Channel,
		messageType: MessageType,
		text: string,
		user?: User
	): Promise<Message> {
		// add info message
		const messageCreated: Message = new Message();
		messageCreated.channel = channel as Channel;
		messageCreated.messageType = messageType;
		messageCreated.text = text;
		messageCreated.user = user;
		const newMessage: Message = await this.messageRepository.save(
			this.messageRepository.create(messageCreated)
		);
		return newMessage;
	}

	async sendMessage(message: Message) {
		this.chatGateway.sendMessageToChannel(
			message.channel.id,
			message.toDto()
		);
	}

	async deleteMessage(id: number): Promise<boolean> {
		const retrieveMsg = await this.messageRepository.findOne(id);
		if (!retrieveMsg) return false;
		await this.messageRepository.remove([retrieveMsg]);
		return true;
	}

	async createChannel(
		channel: CreateChannelDto & { owner: User }
	): Promise<ChannelDto> {
		const channelCreated = this.channelRepository.create({
			name: channel.name,
			channelType: channel.channelType,
			owner: channel.owner,
			users: [channel.owner],
			admins: [],
			messages: [],
		});
		if (channel.channelType === 'protected') {
			if (!channel.password) {
				throw new HttpException('Password is required', 400);
			}
			// generate salt
			channelCreated.password_salt = crypto
				.randomBytes(16)
				.toString('hex');
			// generate hash
			channelCreated.password_hash = crypto
				.pbkdf2Sync(
					channel.password,
					channelCreated.password_salt,
					1000,
					64,
					'sha512'
				)
				.toString('hex');
		}

		const newChannel: Channel = await this.channelRepository.save(
			channelCreated
		);
		newChannel.messages.push(
			await this.createMessage(
				newChannel,
				'system',
				`${channel.owner.displayName} created the channel`
			)
		);

		return newChannel.toDto(
			await this.userService.getBlockedUsers(channel.owner),
			channel.owner
		);
	}

	async createDirectChannel(userId: number, user: User) {
		const user2 = await this.userService.findUserById(userId);
		if (!user2) {
			throw new HttpException('User not found', 404);
		}

		if (user.id === user2.id) {
			throw new HttpException(
				'You cannot create a direct channel with yourself',
				400
			);
		}

		const channels = (await this.channelRepository.find({
			relations: ['users'],
			where: {
				channelType: 'direct',
			},
		})) as DirectChannel[];

		const channel = channels.find(
			(channel) =>
				channel.users.find((user) => user.id === user2.id) &&
				channel.users.find((user) => user.id === user.id)
		);

		if (channel) {
			return channel.toDto(
				await this.userService.getBlockedUsers(user),
				user
			);
		}

		const channelCreated = this.channelRepository.create({
			channelType: 'direct',
			users: [user, user2],
			messages: [],
			admins: [],
		});
		const newChannel: Channel = await this.channelRepository.save(
			channelCreated
		);
		this.chatGateway.newChannelToUser(
			newChannel.toDto(
				await this.userService.getBlockedUsers(user2),
				user2
			),
			user2.id
		);
		return newChannel.toDto(
			await this.userService.getBlockedUsers(user),
			user
		);
	}

	async retrieveDirectChannel(
		users: [number, number]
	): Promise<IChannel | Channel> {
		const user1 = await this.userService.findUserById(users[0]);
		const user2 = await this.userService.findUserById(users[1]);

		if (!user1 || !user2) throw new Error('Undefined user(s)');

		const channels = (await this.channelRepository.find({
			relations: ['users'],
			where: {
				channelType: 'direct',
			},
		})) as DirectChannel[];
		const channel = channels.find(
			(channel) =>
				channel.users.find((user) => user.id === user1.id) &&
				channel.users.find((user) => user.id === user2.id)
		);

		if (channel) {
			return channel;
		}

		const channelCreated = this.channelRepository.create({
			channelType: 'direct',
			users: [user1, user2],
			messages: [],
			admins: [],
		});
		const newChannel: Channel = await this.channelRepository.save(
			channelCreated
		);
		this.chatGateway.newChannelToUser(
			newChannel.toDto(
				await this.userService.getBlockedUsers(user2),
				user2
			),
			user2.id
		);
		return newChannel;
	}

	async getPublicChannels(): Promise<GroupChannel[]> {
		return this.channelRepository.find({
			where: { channelType: 'public' },
		}) as Promise<GroupChannel[]>;
	}

	async getProtectedChannels(): Promise<ProtectedChannel[]> {
		return this.channelRepository.find({
			where: { channelType: 'protected' },
		}) as Promise<ProtectedChannel[]>;
	}

	async getPublicAndProtectedChannels(): Promise<GroupChannel[]> {
		const publicChannels = await this.getPublicChannels();
		const protectedChannels = await this.getProtectedChannels();
		return [...publicChannels, ...protectedChannels];
	}

	async joinChannel(
		channel: JoinChannelDto,
		user: User
	): Promise<ChannelDto> {
		const channelToJoin = await this.getChannel(channel.id);

		if (!channelToJoin) {
			throw new HttpException('Channel not found', 404);
		}

		if (channelToJoin.channelType === 'private') {
			throw new HttpException(
				'This channel is private, you must be invited',
				403
			);
		}

		if (channelToJoin.channelType === 'direct') {
			throw new HttpException('You can not join a direct channel', 400);
		}

		if (channelToJoin.channelType === 'protected') {
			if (!channel.password) {
				throw new HttpException('Request malformed', 400);
			}
			const hash = crypto
				.pbkdf2Sync(
					channel.password,
					channelToJoin.password_salt,
					1000,
					64,
					'sha512'
				)
				.toString('hex');
			if (hash !== channelToJoin.password_hash) {
				throw new HttpException('Wrong password', 401);
			}
		}

		if (channelToJoin.users.some((u) => u.id === user.id)) {
			throw new HttpException('User already in channel', 400);
		}

		if (channelToJoin.isUserBanned(user)) {
			const punishment = channelToJoin.getActivePunishment(user);
			if (!punishment) {
				throw new HttpException('User is banned', 403);
			}
			const expirationDate = punishment.expiration;

			if (expirationDate) {
				throw new HttpException(
					`User banned until ${expirationDate.toLocaleString(
						'fr-FR'
					)}`,
					403
				);
			}

			throw new HttpException('User banned', 403);
		}

		channelToJoin.users.push(user);
		const msg = await this.createMessage(
			channelToJoin,
			'system',
			`${user.displayName} joined the channel`
		);
		await this.sendMessage(msg);
		channelToJoin.messages.push(msg);
		await this.chatGateway.addNewUser(channelToJoin.id, user);
		return (await this.channelRepository.save(channelToJoin)).toDto(
			await this.userService.getBlockedUsers(user),
			user
		);
	}

	async leaveChannel(channelId: number, user: User) {
		const channelToLeave = await this.getChannel(channelId, [
			'users',
			'owner',
			'admins',
			'messages',
		]);

		if (!channelToLeave) {
			throw new HttpException('Channel not found', 404);
		}

		if (channelToLeave.channelType === 'direct') {
			throw new HttpException('You can not leave a direct channel', 400);
		}

		if (!channelToLeave.users.some((u) => u.id === user.id)) {
			throw new HttpException('User not in channel', 400);
		}
		channelToLeave.users = channelToLeave.users.filter(
			(u) => u.id !== user.id
		);
		const msg = await this.createMessage(
			channelToLeave,
			'system',
			`${user.displayName} left the channel`
		);
		await this.sendMessage(msg);
		channelToLeave.messages.push(msg);
		this.chatGateway.removeUserChannel(channelToLeave.id, user);

		// check if channel is empty
		if (channelToLeave.users.length === 0) {
			// cascade delete
			this.channelRepository.delete(channelToLeave.id);
		} else {
			// remove user in case he is admin
			channelToLeave.admins = channelToLeave.admins.filter(
				(u) => u.id !== user.id
			);

			// is user is owner, set new owner from admin
			// is no admin left, choose new owner from users
			if (channelToLeave.owner.id === user.id) {
				if (channelToLeave.admins.length > 0) {
					channelToLeave.owner = channelToLeave.admins[0];
				} else {
					channelToLeave.owner = channelToLeave.users[0];
				}
				const message = await this.createMessage(
					channelToLeave,
					'system',
					`${channelToLeave.owner.displayName} is now the owner of the channel`
				);
				await this.sendMessage(message);
				channelToLeave.messages.push(message);
				this.chatGateway.updateChannelMetadata(channelToLeave);
			}
			this.channelRepository.save(channelToLeave);
		}
	}

	async createPunishment(
		punisher: User,
		createPunishmentDto: CreatePunishmentDto
	) {
		const channel = await this.getChannel(createPunishmentDto.channelId);

		if (!channel) {
			throw new HttpException('Channel not found', 404);
		}

		if (channel.channelType === 'direct') {
			throw new HttpException(
				'You can not punish on a direct channel',
				400
			);
		}

		if (
			!channel.admins.some((u) => u.id === punisher.id) &&
			channel.owner.id !== punisher.id
		) {
			throw new HttpException('User is not an admin', 403);
		}

		const user = await this.userService.findUserById(
			createPunishmentDto.userId
		);
		if (!user) {
			throw new HttpException('User not found', 404);
		}

		if (!channel.users.some((u) => u.id === user.id)) {
			throw new HttpException('User not in channel', 400);
		}

		if (
			channel.admins.some((u) => u.id === createPunishmentDto.userId) ||
			channel.owner.id === createPunishmentDto.userId
		) {
			throw new HttpException('User is an admin', 403);
		}

		const expiration = createPunishmentDto.expiration
			? new Date(createPunishmentDto.expiration)
			: undefined;

		if (expiration && expiration < new Date()) {
			throw new HttpException('Expiration date is in the past', 400);
		}

		const punishment = this.punishmentRepository.create({
			user,
			channel,
			reason: createPunishmentDto.reason,
			type: createPunishmentDto.type,
			expiration:
				createPunishmentDto.type !== 'kick' ? expiration : new Date(),
			admin: punisher.displayName,
		});

		const savedPunishment = await this.punishmentRepository.save(
			punishment
		);

		channel.punishments.push(savedPunishment);

		let msg: Message;

		if (createPunishmentDto.type === 'kick') {
			msg = await this.createMessage(
				channel,
				'system',
				`${user.displayName} is kicked by ${punisher.displayName} ${
					createPunishmentDto.reason
						? `for ${createPunishmentDto.reason}`
						: ''
				}`
			);
		} else {
			msg = await this.createMessage(
				channel,
				'system',
				`${user.displayName} is ${
					createPunishmentDto.type === 'ban' ? 'banned' : 'muted'
				} by ${punisher.displayName} ${
					createPunishmentDto.reason
						? `for ${createPunishmentDto.reason}`
						: ''
				} until ${
					savedPunishment.expiration
						? savedPunishment.expiration.toLocaleString('fr-FR')
						: 'forever'
				}`
			);
		}

		// info message
		await this.sendMessage(msg);
		channel.messages.push(msg);
		if (
			createPunishmentDto.type === 'ban' ||
			createPunishmentDto.type === 'kick'
		) {
			await this.chatGateway.removeUserChannel(channel.id, user);
			channel.users = channel.users.filter((u) => u.id !== user.id);
		}
		await this.channelRepository.save(channel);
		return savedPunishment.toDto();
	}

	async getChannelPunishments(channelId: number, user: User) {
		const channel = await this.getChannel(channelId, [
			'punishments',
			'punishments.user',
			'admins',
			'owner',
		]);

		if (!channel) {
			throw new HttpException('Channel not found', 404);
		}

		if (channel.channelType === 'direct') {
			throw new HttpException(
				'You can not get punishments on a direct channel',
				400
			);
		}

		if (
			!channel.admins.some((u) => u.id === user.id) &&
			channel.owner.id !== user.id
		) {
			throw new HttpException('User is not an admin', 403);
		}
		return channel.punishments.map((p) => p.toDto());
	}

	async deletePunishment(
		channelId: number,
		userId: number,
		user: User,
		punishmentType: PunishmentType
	) {
		const channel = await this.getChannel(channelId, [
			'punishments',
			'punishments.user',
			'admins',
			'owner',
		]);

		if (!channel) {
			throw new HttpException('Channel not found', 404);
		}

		if (channel.channelType === 'direct') {
			throw new HttpException(
				'You can not delete a punishment on a direct channel',
				400
			);
		}

		if (
			!channel.admins.some((u) => u.id === user.id) &&
			channel.owner.id !== user.id
		) {
			throw new HttpException('User is not an admin', 403);
		}

		channel.punishments = channel.punishments.map((p) => {
			if (
				p.type === punishmentType &&
				p.user.id === userId &&
				(!p.expiration || p.expiration > new Date())
			) {
				p.expiration = new Date();
				this.punishmentRepository.save(p);
				return p;
			}
			return p;
		});
		await this.channelRepository.save(channel);
		return channel.punishments.map((p) => p.toDto());
	}

	async inviteUser(channelId: number, userId: number, user: User) {
		const channel = await this.getChannel(channelId);

		if (!channel) {
			throw new HttpException('Channel not found', 404);
		}

		if (channel.channelType === 'direct') {
			throw new HttpException(
				'You can not invite users on a direct channel',
				400
			);
		}

		if (!channel.users.some((u) => u.id === user.id)) {
			throw new HttpException('You are not in the channel', 403);
		}
		const invitedUser = await this.userService.findUserById(userId);
		if (!invitedUser) {
			throw new HttpException('invitedUser not found', 404);
		}
		if (channel.users.some((u) => u.id === invitedUser.id)) {
			throw new HttpException('User is already in the channel', 403);
		}

		if (
			channel.punishments.some(
				(p) =>
					p.type === 'ban' &&
					p.user.id === invitedUser.id &&
					(!p.expiration || p.expiration > new Date())
			)
		) {
			throw new HttpException('User is banned in the channel', 403);
		}

		channel.users.push(invitedUser);
		const msg = await this.createMessage(
			channel,
			'system',
			`${user.displayName} invited ${invitedUser.displayName} to the channel`
		);
		await this.sendMessage(msg);
		channel.messages.push(msg);
		this.chatGateway.addNewUser(channel.id, invitedUser);
		this.chatGateway.newChannelToUser(
			channel.toDto(
				await this.userService.getBlockedUsers(invitedUser),
				invitedUser
			),
			invitedUser.id
		);
		await this.channelRepository.save(channel);
	}

	async editChannel(
		channelId: number,
		user: User,
		editChannelDto: EditChannelDto
	) {
		const channel = await this.getChannel(channelId, [
			'admins',
			'owner',
			'messages',
			'messages.user',
		]);

		if (!channel) {
			throw new HttpException('Channel not found', 404);
		}

		if (channel.channelType === 'direct') {
			throw new HttpException('You can not edit a direct channel', 400);
		}

		if (channel.owner.id !== user.id) {
			throw new HttpException('User is not the owner', 403);
		}

		if (editChannelDto.password && editChannelDto.type !== 'protected') {
			throw new HttpException(
				'You can only set a password on a protected channel',
				400
			);
		}

		if (
			editChannelDto.type === 'protected' &&
			!editChannelDto.password &&
			!channel.password_hash
		) {
			throw new HttpException(
				'You must set a password on a protected channel',
				400
			);
		}

		if (editChannelDto.name) {
			channel.name = editChannelDto.name;
			const msg = await this.createMessage(
				channel,
				'system',
				`${user.displayName} changed the channel name to ${editChannelDto.name}`
			);
			await this.sendMessage(msg);
			channel.messages.push(msg);
		}
		if (editChannelDto.type !== channel.channelType) {
			channel.channelType = editChannelDto.type;
			const msg = await this.createMessage(
				channel,
				'system',
				`${user.displayName} changed the channel type to ${editChannelDto.type}`
			);
			await this.sendMessage(msg);
			channel.messages.push(msg);
		}

		if (editChannelDto.password) {
			const salt = crypto.randomBytes(16).toString('hex');
			// generate hash
			const hash = crypto
				.pbkdf2Sync(editChannelDto.password, salt, 1000, 64, 'sha512')
				.toString('hex');
			channel.password_hash = hash;
			channel.password_salt = salt;
		}

		await this.channelRepository.save(channel);
		this.chatGateway.updateChannelMetadata(channel);
		return { status: 'ok', message: 'Channel edited' };
	}

	async addAdmin(channelId: number, userId: number, user: User) {
		const channel = await this.getChannel(channelId, [
			'admins',
			'owner',
			'messages',
			'messages.user',
		]);

		if (!channel) {
			throw new HttpException('Channel not found', 404);
		}

		if (channel.channelType === 'direct') {
			throw new HttpException(
				'You can not add admins to a direct channel',
				400
			);
		}

		if (channel.owner.id !== user.id) {
			throw new HttpException('User is not the owner', 403);
		}
		const admin = await this.userService.findUserById(userId);
		if (!admin) {
			throw new HttpException('user not found', 404);
		}
		if (channel.admins.some((u) => u.id === admin.id)) {
			throw new HttpException('User is already an admin', 403);
		}
		channel.admins.push(admin);
		const msg = await this.createMessage(
			channel,
			'system',
			`${user.displayName} added ${admin.displayName} to the channel admins`
		);
		await this.sendMessage(msg);
		channel.messages.push(msg);
		await this.channelRepository.save(channel);
		this.chatGateway.updateChannelMetadata(channel);
		return { status: 'ok', message: 'Admin added' };
	}

	async removeAdmin(channelId: number, userId: number, user: User) {
		const channel = await this.getChannel(channelId, [
			'admins',
			'owner',
			'messages',
			'messages.user',
		]);

		if (!channel) {
			throw new HttpException('Channel not found', 404);
		}

		if (channel.channelType === 'direct') {
			throw new HttpException(
				'You can not remove admins from a direct channel',
				400
			);
		}

		if (channel.owner.id !== user.id) {
			throw new HttpException('User is not the owner', 403);
		}
		const admin = await this.userService.findUserById(userId);
		if (!admin) {
			throw new HttpException('user not found', 404);
		}
		if (!channel.admins.some((u) => u.id === admin.id)) {
			throw new HttpException('User is not an admin', 403);
		}
		channel.admins = channel.admins.filter((u) => u.id !== admin.id);
		const msg = await this.createMessage(
			channel,
			'system',
			`${user.displayName} removed ${admin.displayName} from the channel admins`
		);
		await this.sendMessage(msg);
		channel.messages.push(msg);
		await this.channelRepository.save(channel);
		this.chatGateway.updateChannelMetadata(channel);
		return { status: 'ok', message: 'Admin removed' };
	}
}
