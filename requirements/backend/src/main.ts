import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	const configService = app.get<ConfigService>(ConfigService);
	const port: number = Number(configService.get('BACKEND_PORT'));

	if (configService.get('RUN_ENV') !== 'PROD') {

		const config = new DocumentBuilder()
			.setTitle('ft_trancendence')
			.setDescription('ft_trancendence API description')
			.setVersion('indev')
			.addTag('REST')
			.build();
		const document = SwaggerModule.createDocument(app, config);
		SwaggerModule.setup('', app, document);
	}
	await app.listen(port, () => { Logger.log("Listening on port " + port, "ListenCallback") });
}
bootstrap();
