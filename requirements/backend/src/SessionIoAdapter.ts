import { INestApplication } from "@nestjs/common";
import { IoAdapter } from "@nestjs/platform-socket.io";
import { ServerOptions, Server } from 'socket.io';

export class SessionIoAdapter extends IoAdapter {
	constructor(app: INestApplication, private origin: string, private middlewares: ((request: any, res: any, next: any) => void)[]) {
		super(app);
	}

	create(port: number, options?: ServerOptions & {
		namespace?: string;
		server?: any;
	}): Server {
		const server = super.create(port,
			{
				...options,
				cors:
				{
					origin: this.origin,
					methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
					credentials: true,
				}
			});

		this.middlewares.forEach(middleware => {
			server.use((socket: any, next: any) => {
				middleware(socket.request, socket.request.res || {}, next);
			});
		});
		return (server);
	}
}
