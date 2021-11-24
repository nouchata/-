import { DynamicModule, Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { hostname } from 'os';

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

dyn_import = [ ...dyn_import, TypeOrmModule.forRoot({
	type: 'postgres',
	host: process.env.DB_HOSTNAME,
	port: Number(process.env.DB_PORT),
	username: process.env.DB_USER,
	password: process.env.DB_PASS,
	database: process.env.DB_NAME,
	entities: [],
	retryAttempts: 5,
	retryDelay: 5000
})]

@Module({
	imports: dyn_import,
	controllers: [],
	providers: [],
})
export class AppModule { }
