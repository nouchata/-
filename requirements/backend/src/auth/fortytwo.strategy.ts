import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-42";

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy) {
	constructor() {
		super({
			clientID: process.env.UID_42,
			clientSecret: process.env.SECRET_42,
			callbackURL: process.env.CALLBACK_URL_42,
		});
	}

	async validate(accessToken: string, refreshToken: string, profile, cb)
	{
		console.log(profile);
	}
}
