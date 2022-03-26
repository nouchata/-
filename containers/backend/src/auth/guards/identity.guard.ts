import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class IdentityGuard implements CanActivate {
	async canActivate(context: ExecutionContext): Promise<boolean> {
		const req = context.switchToHttp().getRequest();
		if (req.isAuthenticated()) {
			return req.params.id == req.user.id;
		}
		return false;
	}
}
