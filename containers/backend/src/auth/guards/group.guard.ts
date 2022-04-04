import {
	CanActivate,
	ExecutionContext,
	HttpException,
	HttpStatus,
	Injectable,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Session } from 'express-session';
import { Observable } from 'rxjs';
import { Session2FaDTO } from '../../tfa/dtos/session-2fa.dto';

@Injectable()
export class GroupGuard implements CanActivate {
	canActivate(context: ExecutionContext): boolean {
		const request = context.switchToHttp().getRequest();

		if (request.isAuthenticated()) {
			if (
				(request.session as Session & Session2FaDTO).twofa.needed &&
				!(request.session as Session & Session2FaDTO).twofa.passed &&
				context.getClass().name !== 'TfaController'
			)
				throw new HttpException(
					{
						status: HttpStatus.UNAUTHORIZED,
						error: 'The 2FA authentication is not fulfilled',
					},
					HttpStatus.UNAUTHORIZED
				);
			return true;
		}
		return false;
	}
}

@Injectable()
export class WsGroupGuard implements CanActivate {
	canActivate(
		context: ExecutionContext
	): boolean | Promise<boolean> | Observable<boolean> {
		const request = context.switchToWs().getClient().request;

		if (request.isAuthenticated()) {
			if (
				(request.session as Session & Session2FaDTO).twofa.needed &&
				!(request.session as Session & Session2FaDTO).twofa.passed &&
				context.getClass().name !== 'TfaController'
			)
				throw new WsException(
					'The 2FA authentication is not fulfilled'
				);
			return true;
		}
		return false;
	}
}
