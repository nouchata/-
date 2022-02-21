import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-42';
import { User } from 'src/user/entities/user.entity';
import { AuthService } from './auth.service';
import { Profile42 } from './utils/Profile42';
import { UserDetails } from './utils/UserDetails';

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy) {
	constructor(private authService: AuthService) {
		super({
			clientID: process.env.UID_42,
			clientSecret: process.env.SECRET_42,
			callbackURL: process.env.CALLBACK_URL_42,
		});
	}

	async validate(
		_accessToken: string,
		_refreshToken: string,
		profile: Profile42,
		cb: (err: Error | null, user: User) => void
	) {
		// console.log('validate breakpoint');
		let email: string;
		let picture: string | undefined = undefined;

		if (profile.emails && profile.emails.length > 0)
			email = profile.emails[0].value;
		else email = profile.username + '@student.42.fr';

		if (profile.photos && profile.photos.length > 0)
			picture = profile.photos[0].value;
		else picture = undefined;

		const details: UserDetails = {
			login: profile.username,
			displayName: profile.displayName,
			profileURL: profile.profileUrl,
			email: email,
			picture: picture,
		};
		const user: User = await this.authService.validateUser(details);

		return cb(null, user);
	}
}
