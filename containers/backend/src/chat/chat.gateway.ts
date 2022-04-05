import { UserService } from 'src/user/user.service';
import { Inject, UseGuards, forwardRef } from '@nestjs/common';
import {
	SubscribeMessage,
	WebSocketGateway,
	WsException,
} from '@nestjs/websockets';
import { WsGroupGuard } from 'src/auth/guards/group.guard';
import { Socket } from 'socket.io';
import { User } from 'src/user/entities/user.entity';
import { ChannelService } from './channel/channel.service';
import { ChannelDto, MessageDto } from './dtos/user-channels.dto';
import { GroupChannel } from './entities/channel.entity';
import { UserStatus } from 'src/user/interface/UserInterface';

@WebSocketGateway({ cors: true, namespace: 'chat' })
export class ChatGateway {
	constructor(
		@Inject(forwardRef(() => ChannelService))
		private channelService: ChannelService,
		private userService: UserService
	) {}

	private userSockets = new Map<
		number,
		{ socket: Socket; channels: number[] }
	>();

	async sendMessageToChannel(channelId: number, message: MessageDto) {
		this.userSockets.forEach(async (userSocket, id) => {
			const blockedUsers = await this.userService.getBlockedUsers({
				id,
			});
			if (
				userSocket.channels.includes(channelId) &&
				!blockedUsers.some((u) => u.id === message.userId)
			) {
				userSocket.socket.emit('receiveMessage', {
					...message,
					channelId: channelId,
				});
			}
		});
	}

	async addNewUser(channelId: number, user: User) {
		this.userSockets.forEach((userSocket) => {
			if (userSocket.channels.includes(channelId)) {
				userSocket.socket.emit('newUser', {
					...user,
					channelId: channelId,
				});
			}
		});
	}

	async removeUserChannel(channelId: number, user: User) {
		this.userSockets.forEach((userSocket) => {
			if (userSocket.channels.includes(channelId)) {
				userSocket.socket.emit('removeUser', {
					...user,
					channelId: channelId,
				});
			}
		});

		const userSocket = this.userSockets.get(user.id);
		if (userSocket) {
			userSocket.channels = userSocket.channels.filter(
				(c) => c !== channelId
			);
		}
	}

	async newChannelToUser(channel: ChannelDto, userId: number) {
		const userSocket = this.userSockets.get(userId);
		if (userSocket) {
			userSocket.socket.emit('newChannel', channel);
		}
	}

	async updateChannelMetadata(
		channel: GroupChannel,
		getUserStatus: (user: { id: number }) => Promise<UserStatus>
	) {
		const newMetadata = {
			id: channel.id,
			name: channel.name,
			admins: channel.admins
				? await Promise.all(
						channel.admins.map((u) => u.toDto(getUserStatus))
				  )
				: undefined,
			owner: await channel.owner.toDto(getUserStatus),
			channelType: channel.channelType,
		};
		this.userSockets.forEach((userSocket) => {
			if (userSocket.channels.includes(channel.id)) {
				userSocket.socket.emit('updateChannelMetadata', newMetadata);
			}
		});
	}

	isUserConnected(userId: number) {
		return this.userSockets.has(userId);
	}

	// handle user connection
	@UseGuards(WsGroupGuard)
	handleConnection(client: Socket & { request: { user?: User } }) {
		if (!client.request.user)
			return client.emit('unauthorized', 'You are not authorized');
		this.userSockets.set(client.request.user.id, {
			socket: client,
			channels: [],
		});
	}

	// handle user disconnection
	@UseGuards(WsGroupGuard)
	handleDisconnect(client: Socket & { request: { user?: User } }) {
		if (!client.request.user) return;
		this.userSockets.delete(client.request.user.id);
	}

	@UseGuards(WsGroupGuard)
	@SubscribeMessage('connectChannel')
	async handleJoinChannel(
		client: Socket & { request: { user: User } },
		{ channelId }: { channelId: number }
	) {
		const channelFound = await this.channelService.getChannel(channelId);

		if (!channelFound) throw new WsException('Channel not found');

		if (!channelFound.canUserAccess(client.request.user))
			throw new WsException('You are not authorized');

		const userSocket = this.userSockets.get(client.request.user.id);

		if (!userSocket) throw new WsException('User not found');

		if (!userSocket.channels.includes(channelId))
			userSocket.channels.push(channelId);
	}

	@UseGuards(WsGroupGuard)
	@SubscribeMessage('sendMessage')
	async handleSendMessage(
		client: Socket & { request: { user: User } },
		{ channelId, text }: { channelId: number; text: string }
	) {
		const channelFound = await this.channelService.getChannel(channelId);
		if (!channelFound) throw new WsException('Channel not found');

		if (!channelFound.canUserTalk(client.request.user))
			throw new WsException('You are not authorized');

		const message = await this.channelService.createMessage(
			channelFound,
			'user',
			text,
			client.request.user
		);

		const msg: MessageDto & { channelId: number } = {
			id: message.id,
			messageType: message.messageType,
			channelId: channelId,
			text: text,
			userId: client.request.user.id,
		};
		this.sendMessageToChannel(channelId, msg);
	}
}
