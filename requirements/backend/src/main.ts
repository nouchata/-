import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get<ConfigService>(ConfigService);
  const port: number = Number(configService.get('BACKEND_PORT'));
  await app.listen(port, () => {Logger.log("Listening on port " + port, "ListenCallback")});
}
bootstrap();
