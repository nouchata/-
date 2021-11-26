import { DynamicModule, Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { hostname } from 'os';
import { User } from './user/entities/user.entity';
import { UserModule } from './user/user.module';

let dyn_import: DynamicModule[] = []

if (process.env.RUN_ENV === "PROD") {
	Logger.log('Running in PROD mode', 'Config');
	dyn_import.push(ConfigModule.forRoot({
		isGlobal: true
	}));
}
else if (process.env.RUN_ENV === "TEST") {
	Logger.log('Running in TEST mode', 'Config');
	dyn_import.push(ConfigModule.forRoot({
		isGlobal: true
	}));
}
else {
	Logger.log('Running in DEV mode', 'Config');
	dyn_import.push(ConfigModule.forRoot({
		envFilePath: 'dev.env',
		isGlobal: true
	}));
}


@Module({
	imports: [...dyn_import, TypeOrmModule.forRoot({
		type: 'postgres',
		host: process.env.DB_HOSTNAME,
		port: Number(process.env.DB_PORT),
		username: process.env.DB_USER,
		password: process.env.DB_PASS,
		database: process.env.DB_NAME,
		entities: [User],
		synchronize: true,
		retryAttempts: 5,
		retryDelay: 5000
	}), UserModule],
	controllers: [],
	providers: [],
})
export class AppModule {}
