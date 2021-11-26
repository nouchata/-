import { Module } from '@nestjs/common';
import { UserModule } from 'src/user/user.module';
import { UserService } from 'src/user/user.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { FortyTwoStrategy } from './fortytwo.strategy';
import { SessionSerializer } from './serializer';

@Module({
	imports: [UserModule],
	controllers: [AuthController],
	providers: [AuthService, FortyTwoStrategy, SessionSerializer]
})
export class AuthModule { }
