import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src/user/user.module';
import { UserService } from 'src/user/user.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { FortyTwoStrategy } from './fortytwo.strategy';
import { GroupGuard } from './guards/group.guard';
import { SessionSerializer } from './serializer';
import { SessionEntity } from './session.entity';

@Module({
	imports: [UserModule, TypeOrmModule.forFeature([SessionEntity])],
	controllers: [AuthController],
	providers: [AuthService, FortyTwoStrategy, SessionSerializer, GroupGuard]
})
export class AuthModule { }
