import { Injectable } from "@nestjs/common";
import { PassportSerializer } from "@nestjs/passport";
import { User } from "src/user/entities/user.entity";
import { UserService } from "src/user/user.service";

@Injectable()
export class SessionSerializer extends PassportSerializer
{
	constructor(private userService: UserService) {
		super();
	}

	serializeUser(user: User, done: (err: Error, login: string) => void) {
		done(null, user.login);
	}
	
	async deserializeUser(payload: string, done: (err: Error, user: User) => void) {
		const userDb: User = await this.userService.findUser({login: payload});

		if (userDb)
			return done(null, userDb);
		else
			return done(null, null);
	}
}
