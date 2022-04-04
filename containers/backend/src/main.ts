import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import session from 'express-session';
import passport from 'passport';
import { getRepository } from 'typeorm';
import { ISession, TypeormStore } from 'connect-typeorm/out';
import { SessionEntity } from './auth/session.entity';
import { SessionIoAdapter } from './SessionIoAdapter';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	const configService = app.get<ConfigService>(ConfigService);
	const port = Number(configService.get('BACKEND_PORT'));
	const front_address = configService.get('FRONTEND_ADDRESS');

	if (front_address) {
		app.enableCors({
			origin: front_address,
			credentials: true,
		});
	}

	// verify user content
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			transform: true,
		})
	);

	const sessionRepo = getRepository<ISession>(SessionEntity);

	const sessionMiddleware = session({
		cookie: {
			maxAge: 86400000 * 4,
			sameSite: front_address ? 'none' : 'strict',
		},
		secret: process.env.COOKIE_SECRET as string,
		resave: false,
		saveUninitialized: false,
		store: new TypeormStore().connect(sessionRepo),
	});

	const passportMiddleware = passport.initialize();
	const passportSessionMiddleware = passport.session();

	app.use(sessionMiddleware);
	app.use(passportMiddleware);
	app.use(passportSessionMiddleware);

	app.useWebSocketAdapter(
		new SessionIoAdapter(app, front_address, [
			sessionMiddleware,
			passportMiddleware,
			passportSessionMiddleware,
		])
	);

	if (configService.get('RUN_ENV') !== 'PROD') {
		const config = new DocumentBuilder()
			.setTitle('ft_trancendence')
			.setDescription('ft_trancendence API description')
			.setVersion('indev')
			.build();
		const document = SwaggerModule.createDocument(app, config);
		SwaggerModule.setup('', app, document);
	}
	await app.listen(port, () => {
		Logger.log('Listening on port ' + port, 'ListenCallback');
	});
}
bootstrap();
