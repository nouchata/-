import { Inject, Logger, UseGuards, forwardRef } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway, WebSocketServer, WsException } from '@nestjs/websockets';
import { WsGroupGuard } from 'src/auth/guards/group.guard';
import { Socket, Server } from 'socket.io';
import { User } from 'src/user/entities/user.entity'
import { ChannelService } from './channel/channel.service';
import { Channel } from './entities/channel.entity';
import { MessageDto } from './dtos/user-channels.dto';

@WebSocketGateway({ cors: true, namespace: 'chat' })
export class ChatGateway {
	constructor(
		@Inject(forwardRef(() => ChannelService))
		private channelService: ChannelService,
	) { }

	@WebSocketServer()
	wsServer: Server;

	// [userId: number] => Socket
	private userSockets: { [userId: number]: Socket } = {};

	async sendMessageToChannel(channelId: number, message: MessageDto) {
		this.wsServer.to("channel#" + channelId).emit('receiveMessage', {...message, channelId: channelId});
	}

	async addNewUser(channelId: number, user: User) {
		this.wsServer.to("channel#" + channelId).emit('newUser', {...user, channelId: channelId});
	}

	async removeUserChannel(channelId: number, user: User) {
		// remove user from room
		this.wsServer.to("channel#" + channelId).emit('removeUser', {...user, channelId: channelId});
		this.userSockets[user.id].leave("channel#" + channelId);
	}

	// handle user connection
	@UseGuards(WsGroupGuard)
	handleConnection(client: Socket & { request: { user: User } }) {
		this.userSockets[client.request.user.id] = client;
	}

	// handle user disconnection
	@UseGuards(WsGroupGuard)
	handleDisconnect(client: Socket & { request: { user: User } }) {
		delete this.userSockets[client.request.user.id];
	}

	@UseGuards(WsGroupGuard)
	@SubscribeMessage('connectChannel')
	async handleJoinChannel(client: Socket & { request: { user: User } }, { channelId }: { channelId: number }) {
		let channelFound = await this.channelService.getChannel(channelId);

		if (channelFound) {
			if (channelFound.canUserAccess(client.request.user)) {
				client.join("channel#" + channelId);
				client.emit('joinedChannel', channelFound);
			}
			else
				throw new WsException('You are not allowed to join this channel');
		}
		else
			throw new WsException('Channel not found');
	}

	@UseGuards(WsGroupGuard)
	@SubscribeMessage('sendMessage')
	async handleSendMessage(client: Socket & { request: { user: User } }, { channelId, text }: { channelId: number, text: string }) {
		let channelFound = await this.channelService.getChannel(channelId);

		if (channelFound) {
			if (channelFound.canUserAccess(client.request.user)) {
				let message = await this.channelService.createMessage(
					channelFound,
					'user',
					text,
					client.request.user
				)

				let msg: MessageDto & { channelId: number } = {
					id: message.id,
					messageType: message.messageType,
					channelId: channelId,
					text: text,
					userId: client.request.user.id,
				};
				this.sendMessageToChannel(channelId, msg);
			}
			else
				throw new WsException('You are not allowed to send messages to this channel');
		}
		else
			throw new WsException('Channel not found');
	}

	
}
