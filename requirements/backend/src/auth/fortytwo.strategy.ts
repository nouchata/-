import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-42";
import { User } from "src/user/entities/user.entity";
import { AuthService } from "./auth.service";
import { UserDetails } from "./utils/UserDetails";

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy) {
	constructor(private authService: AuthService) {
		super({
			clientID: process.env.UID_42,
			clientSecret: process.env.SECRET_42,
			callbackURL: process.env.CALLBACK_URL_42,
		});
	}

	async validate(accessToken: string, refreshToken: string, profile: any, cb: (err: Error, user: User) => void)
	{
		const { login } = profile;

		const details: UserDetails = {login: profile.username};
		const user: User = await this.authService.validateUser(details);

		return cb(null, user);
	}
}
