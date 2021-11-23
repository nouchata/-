import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

let dyn_import = []

if (process.env.RUN_ENV !== "PROD") {
	Logger.log('Running in DEV mode', 'Config');
	dyn_import.push(ConfigModule.forRoot({
		envFilePath: 'dev.env',
		isGlobal: true
	  }));
}
else
{
	Logger.log('Running in PROD mode', 'Config');
	dyn_import.push(ConfigModule.forRoot({
		isGlobal: true
	  }));
}



@Module({
  imports: dyn_import,
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
