import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
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

		console.log(request);

		if (request.isAuthenticated())
		{
			if (!roles || roles.length === 0)
				return (true);
			else
				return (request.user.hasRole(<UserRole>roles[0]));
		}
	}
}
