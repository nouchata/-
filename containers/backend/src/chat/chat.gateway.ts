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

	// [userId: number] => Socket
	private userSockets: {
		[userId: number]: { socket: Socket; channels: number[] };
	} = {};

	async sendMessageToChannel(channelId: number, message: MessageDto) {
		for (const userId of Object.keys(this.userSockets)) {
			const blockedUsers = await this.userService.getBlockedUsers({
				id: +userId,
			});
			if (
				this.userSockets[+userId]?.channels.includes(channelId) &&
				!blockedUsers.some((u) => u.id === message.userId)
			) {
				this.userSockets[+userId]?.socket.emit('receiveMessage', {
					...message,
					channelId: channelId,
				});
			}
		}
	}

	async addNewUser(channelId: number, user: User) {
		for (const userId of Object.keys(this.userSockets)) {
			if (this.userSockets[+userId]?.channels.includes(channelId)) {
				this.userSockets[+userId]?.socket.emit('newUser', {
					...user,
					channelId: channelId,
				});
			}
		}
	}

	async removeUserChannel(channelId: number, user: User) {
		for (const userId of Object.keys(this.userSockets)) {
			if (this.userSockets[+userId]?.channels.includes(channelId)) {
				this.userSockets[+userId]?.socket.emit('removeUser', {
					...user,
					channelId: channelId,
				});
			}
		}
		if (this.userSockets[user.id]) {
			this.userSockets[user.id].channels = this.userSockets[
				user.id
			].channels.filter((c) => c !== channelId);
		}
	}

	async newChannelToUser(channel: ChannelDto, userId: number) {
		if (this.userSockets[userId]) {
			this.userSockets[userId].socket.emit('newChannel', channel);
		}
	}

	async updateChannelMetadata(
		channel: GroupChannel,
		getUserStatus: (user: { id: number }) => Promise<UserStatus>
	) {
		for (const userId of Object.keys(this.userSockets)) {
			if (this.userSockets[+userId]?.channels.includes(channel.id)) {
				this.userSockets[+userId]?.socket.emit(
					'updateChannelMetadata',
					{
						id: channel.id,
						name: channel.name,
						admins: channel.admins.map((u) =>
							u.toDto(getUserStatus)
						),
						owner: channel.owner.toDto(getUserStatus),
						channelType: channel.channelType,
					}
				);
			}
		}
	}

	// handle user connection
	@UseGuards(WsGroupGuard)
	handleConnection(client: Socket & { request: { user?: User } }) {
		if (!client.request.user)
			return client.emit('unauthorized', 'You are not authorized');
		this.userSockets[client.request.user.id] = {
			socket: client,
			channels: [],
		};
	}

	// handle user disconnection
	@UseGuards(WsGroupGuard)
	handleDisconnect(client: Socket & { request: { user?: User } }) {
		if (!client.request.user) return;
		delete this.userSockets[client.request.user.id];
	}

	@UseGuards(WsGroupGuard)
	@SubscribeMessage('connectChannel')
	async handleJoinChannel(
		client: Socket & { request: { user: User } },
		{ channelId }: { channelId: number }
	) {
		const channelFound = await this.channelService.getChannel(channelId);

		if (channelFound) {
			if (channelFound.canUserAccess(client.request.user)) {
				if (!this.userSockets[client.request.user.id])
					throw new WsException('User not found');
				this.userSockets[client.request.user.id]?.channels.push(
					channelId
				);
				client.emit('joinedChannel', channelFound);
			} else
				throw new WsException(
					'You are not allowed to join this channel'
				);
		} else throw new WsException('Channel not found');
	}

	@UseGuards(WsGroupGuard)
	@SubscribeMessage('sendMessage')
	async handleSendMessage(
		client: Socket & { request: { user: User } },
		{ channelId, text }: { channelId: number; text: string }
	) {
		const channelFound = await this.channelService.getChannel(channelId);

		if (channelFound) {
			if (channelFound.canUserTalk(client.request.user)) {
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
			} else
				throw new WsException(
					'You are not allowed to send messages to this channel'
				);
		} else throw new WsException('Channel not found');
	}
}
