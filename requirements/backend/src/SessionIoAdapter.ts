import { INestApplication } from "@nestjs/common";
import { IoAdapter } from "@nestjs/platform-socket.io";
import { ServerOptions, Server } from 'socket.io';

export class SessionIoAdapter extends IoAdapter {
	constructor(app: INestApplication, private middlewares: {sessionMiddleware: any, passportMiddleware: any, passportSessionMiddleware: any})
	{
		super(app);
	}

	create(port: number, options?: ServerOptions & {
        namespace?: string;
        server?: any;
    }): Server
	{
		const server = super.create(port, options);
		
		server.use((socket: any, next: any) => {
			this.middlewares.sessionMiddleware(socket.request, socket.request.res || {}, next);
		});
		server.use((socket: any, next: any) => {
			this.middlewares.passportMiddleware(socket.request, socket.request.res || {}, next);
		});
		server.use((socket: any, next: any) => {
			this.middlewares.passportSessionMiddleware(socket.request, socket.request.res || {}, next);
		});
		return (server);
	}	
}
