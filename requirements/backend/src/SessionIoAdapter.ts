import { INestApplication } from "@nestjs/common";
import { IoAdapter } from "@nestjs/platform-socket.io";
import { ServerOptions } from 'socket.io';

export class SessionIoAdapter extends IoAdapter {
	constructor(app: INestApplication, private middlewares: {sessionMiddleware: any, passportMiddleware: any, passportSessionMiddleware: any})
	{
		super(app);
	}

	log_middleware = (request, res, next) => {
		console.log(request.url);
		next();
	}

	createIOServer(port: number, options?: ServerOptions): any {

		const server = super.createIOServer(port, options);
		server.use((socket: any, next: any) => {
			this.log_middleware(socket.request, socket.request.res || {}, next);
		});
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
