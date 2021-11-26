import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-42";

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy) {
	constructor() {
		super({});
	}

	async validate(accessToken: string, refreshToken: string, profile, cb)
	{

	}
}
