import { ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class FortyTwoGuard extends AuthGuard('42') {
	async canActivate(context: ExecutionContext) : Promise<any> {
		const activate = (await super.canActivate(context)) as boolean;
		const request = context.switchToHttp().getRequest();
		await super.logIn(request);
		request.session.twofa = { 
			needed: request.user.twofa,
			passed: false
		};
		// console.log(request.user);
		return activate;
	}
}
