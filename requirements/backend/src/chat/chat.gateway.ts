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
	async handleJoinChannel(client: Socket & {request: {user: User}}, channelId: string)
	{
		var channelFound: Channel = await this.channelService.getChannel(Number(channelId));

		console.log(channelFound);
		
		if(channelFound)
		{
			if (channelFound.canUserAccess(client.request.user))
			{
				client.join("channel#" + channelId);
				client.emit('joinedChannel', channelFound);
			}
			else
				throw new WsException('You are not allowed to join this channel');
		}
		else
			throw new WsException('Channel not found');
	}
}
