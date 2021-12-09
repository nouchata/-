import { DynamicModule, Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/entities/user.entity';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { PassportModule } from '@nestjs/passport';
import { SessionEntity } from './auth/session.entity';
import { Friendship } from './user/entities/friendship.entity';
import { MatchHistory } from './user/entities/match-history.entity';
import { Channel } from './chat/entities/channel.entity';
import { Message } from './chat/entities/message.entity';
import { ChatModule } from './chat/chat.module';

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
		entities: [User, SessionEntity, Friendship, MatchHistory, Channel, Message],
		synchronize: true,
		retryAttempts: 5,
		retryDelay: 5000
	}), UserModule,
		AuthModule,
	PassportModule.register({ session: true }),
	ChatModule
	],
	controllers: [],
	providers: [],
})
export class AppModule { }
