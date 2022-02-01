import { CanActivate, ExecutionContext, Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Session } from "express-session";
import { Observable } from "rxjs";
import { Session2FaDTO } from "src/tfa/dtos/session-2fa.dto";
import { User } from "src/user/entities/user.entity";
import { Repository } from "typeorm";
import { SessionOnlineStateDTO } from "../dtos/session-online-state.dto";

@Injectable()
export class OnlineStateGuard implements CanActivate {
	constructor(@InjectRepository(User) private userRepo: Repository<User>) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		let contextUser : any = undefined;
		
		// select the good object regarding the type of request
		if (context.getType() === 'http')
			contextUser = context.switchToHttp().getRequest();
		else if (context.getType() === 'ws')
			contextUser = context.switchToWs().getClient().request;
		
		// assure the user is logged before treating his online state
		if (contextUser && contextUser.isAuthenticated())
		{
			// same if they have 2FA enabled
			if ((contextUser.session as Session & Session2FaDTO).twofa.needed
			&& !(contextUser.session as Session & Session2FaDTO).twofa.passed)
				return (true);
			// switch to online if the user wasn't
			if (!(contextUser.user as User).status || (contextUser.user as User).status === 'offline') {
				(contextUser.user as User).status = 'online';
				await this.userRepo.save((contextUser.user as User));
			}
			// set the debounced closure if it wasn't set
			if (!(contextUser.session as Session & SessionOnlineStateDTO).keepUpOnlineState) {
				(contextUser.session as Session & SessionOnlineStateDTO).keepUpOnlineState = ((userRepo : Repository<User>, userId: number) => {
					let flag: NodeJS.Timeout;
					return function() : void {
						if (flag)
							clearTimeout(flag);
						flag = setTimeout(async() => {
							await userRepo.save({
								id: userId,
								status: 'offline'
							});
						}, 60000); // set for a minute
					};
				})(this.userRepo, (contextUser.user as User).id);
			}
			// debounce
			(contextUser.session as Session & SessionOnlineStateDTO).keepUpOnlineState();
		}
		return (true);
	}
};