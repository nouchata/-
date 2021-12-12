import { UseGuards } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { WsGroupGuard } from 'src/auth/guards/group.guard';

@WebSocketGateway({cors: true, namespace: 'chat'})
export class ChatGateway {

	@UseGuards(WsGroupGuard)
	@SubscribeMessage('message')
	handleMessage(client: any, payload: any): string
	{
		return 'Hello world!';
	}
}
