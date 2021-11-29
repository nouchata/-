import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as session from 'express-session';
import * as passport from 'passport';
import { getRepository } from 'typeorm';
import { ISession, TypeormStore } from 'connect-typeorm/out';
import { SessionEntity } from './auth/session.entity';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	const configService = app.get<ConfigService>(ConfigService);
	const port: number = Number(configService.get('BACKEND_PORT'));
	const front_address: string = configService.get('FRONT_ADDRESS');

	app.enableCors({
		origin: front_address,
		credentials: true,
	});

	// verify user content
	app.useGlobalPipes(new ValidationPipe({
		whitelist: true,
		transform: true,
	}))

	const sessionRepo = getRepository<ISession>(SessionEntity);

	app.use(session(
		{
			cookie: {
				maxAge: 86400000,
			},
			secret: process.env.COOKIE_SECRET,
			resave: false,
			saveUninitialized: false,
			store: new TypeormStore().connect(sessionRepo),
		}
	));
	app.use(passport.initialize());
	app.use(passport.session());

	if (configService.get('RUN_ENV') !== 'PROD') {

		const config = new DocumentBuilder()
			.setTitle('ft_trancendence')
			.setDescription('ft_trancendence API description')
			.setVersion('indev')
			.build();
		const document = SwaggerModule.createDocument(app, config);
		SwaggerModule.setup('', app, document);
	}
	await app.listen(port, () => { Logger.log("Listening on port " + port, "ListenCallback") });
}
bootstrap();
