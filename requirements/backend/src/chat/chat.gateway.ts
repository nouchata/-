import { UseGuards } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway, WebSocketServer, WsException } from '@nestjs/websockets';
import { WsGroupGuard } from 'src/auth/guards/group.guard';
import { Socket, Server } from 'socket.io';
import { User } from 'src/user/entities/user.entity'
import { ChannelService } from './channel/channel.service';
import { Channel } from './entities/channel.entity';

@WebSocketGateway({cors: true, namespace: 'chat'})
export class ChatGateway {
	constructor(private channelService: ChannelService) {}

	@WebSocketServer()
	wsServer: Server;

	@UseGuards(WsGroupGuard)
	@SubscribeMessage('joinChannel')
	async handleJoinChannel(client: Socket & {request: {user: User}}, { channelId }: {channelId: number })
	{
		let channelFound: Channel = await this.channelService.getChannel(channelId);

		
		if(channelFound)
		{
			if (channelFound.canUserAccess(client.request.user))
			{
				client.join("channel#" + channelId);
				client.emit('joinedChannel', channelFound);
				console.log("Joined channel " + channelId);
			}
			else
				throw new WsException('You are not allowed to join this channel');
		}
		else
			throw new WsException('Channel not found');
	}

	@UseGuards(WsGroupGuard)
	@SubscribeMessage('sendMessage')
	async handleSendMessage(client: Socket & {request: {user: User}}, { channelId, text }: {channelId: number, text: string})
	{
		let channelFound: Channel = await this.channelService.getChannel(channelId);

		if(channelFound)
		{
			if (channelFound.canUserAccess(client.request.user))
			{
				console.log(client.request.user.login + "(" + channelId+ ") : " + text);
			}
			else
				throw new WsException('You are not allowed to send messages to this channel');
		}
		else
			throw new WsException('Channel not found');
	}
}
