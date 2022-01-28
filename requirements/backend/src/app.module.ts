import { DynamicModule, Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/entities/user.entity';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { PassportModule } from '@nestjs/passport';
import { SessionEntity } from './auth/session.entity';
import { MatchHistory } from './user/entities/match-history.entity';
import { Channel } from './chat/entities/channel.entity';
import { Message } from './chat/entities/message.entity';
import { ChatModule } from './chat/chat.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path/posix';
import { TfaModule } from './auth/tfa/tfa.module';

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
		entities: [User, SessionEntity, MatchHistory, Channel, Message],
		synchronize: true,
		retryAttempts: 5,
		retryDelay: 5000
	}), UserModule,
		AuthModule,
		ChatModule,
		TfaModule,
		PassportModule.register({ session: true }),
		ServeStaticModule.forRoot({
			rootPath: join(__dirname, '..', 'public')
		})
	],
	controllers: [],
	providers: [],
})

export class AppModule { }
