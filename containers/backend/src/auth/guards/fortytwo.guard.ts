import { ExecutionContext, HttpException, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Session } from 'inspector';
import { Session2FaDTO } from '../../tfa/dtos/session-2fa.dto';

@Injectable()
export class FortyTwoGuard extends AuthGuard('42') {
	constructor() {
		super();
	}

	async canActivate(context: ExecutionContext): Promise<any> {
		const activate = (await super.canActivate(context)) as boolean;
		const request = context.switchToHttp().getRequest();
		await super.logIn(request);
		(request.session as Session & Session2FaDTO).twofa = {
			needed: request.user.twofa,
			passed: false,
		};
		return activate;
	}

	handleRequest(err: any, user: any) {
		if (err || !user) {
			throw new HttpException(err.message, 200);
		}
		return user;
	}
}
