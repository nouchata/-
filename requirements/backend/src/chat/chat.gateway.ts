import { UseGuards } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { GroupGuard } from 'src/auth/guards/group.guard';

@WebSocketGateway({cors: true})
export class ChatGateway {

	//@UseGuards(GroupGuard)
	@SubscribeMessage('message')
	handleMessage(client: any, payload: any): string
	{
		console.log(client.request.isAuthenticated());
		return 'Hello world!';
	}
}
