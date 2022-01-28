import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { User } from "src/user/entities/user.entity";
import { UserRole } from "src/user/interface/UserInterface";

@Injectable()
export class GroupGuard implements CanActivate
{
	constructor(private reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
		const request = context.switchToHttp().getRequest();
		const roles = this.reflector.get<string[]>('roles', context.getHandler());

		// console.log(request.session);
		if (request.isAuthenticated())
		{
			if (request.session.twofa?.needed && !request.session.twofa?.passed)
				throw new HttpException({
					status: HttpStatus.UNAUTHORIZED,
					error: "The 2FA authentication is not fulfilled"
				}, HttpStatus.UNAUTHORIZED);
			if (!roles || roles.length === 0)
				return (true);
			else
				return (request.user.hasRole(<UserRole>roles[0]));
		}
	}
}

@Injectable()
export class WsGroupGuard implements CanActivate
{
	constructor(private reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
		const client = context.switchToWs().getClient();
		const roles = this.reflector.get<string[]>('roles', context.getHandler());
		
		if (client.request.isAuthenticated())
		{
			if (!roles || roles.length === 0)
				return (true);
			else
				return (client.request.user.hasRole(<UserRole>roles[0]));
		}
		return (client.request.isAuthenticated());
	}
}
