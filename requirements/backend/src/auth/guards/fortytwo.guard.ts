import { ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Session } from "inspector";
import { Session2FaDTO } from "../tfa/session-twofa.dto";

@Injectable()
export class FortyTwoGuard extends AuthGuard('42') {
	async canActivate(context: ExecutionContext) : Promise<any> {
		const activate = (await super.canActivate(context)) as boolean;
		const request = context.switchToHttp().getRequest();
		await super.logIn(request);
		(request.session as Session & Session2FaDTO).twofa = { 
			needed: request.user.twofa,
			passed: false,
			secret: ''
		};
		// console.log(request.user);
		return activate;
	}
}
