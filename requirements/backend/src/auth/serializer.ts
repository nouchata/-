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

	serializeUser(user: User, done: (err: Error | null, login: string) => void) {
		done(null, user.login);
	}

	async deserializeUser(login: string, done: (err: Error | null, user: User | null) => void) {
		const userDb = await this.userService.findUserByLogin(login);

		if (userDb)
			return done(null, userDb);
		else
			return done(null, null);
	}
}
