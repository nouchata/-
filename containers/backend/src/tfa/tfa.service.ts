import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Session } from 'express-session';
import { authenticator } from 'otplib';
import * as qrcode from 'qrcode';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { Session2FaDTO } from './dtos/session-2fa.dto';

@Injectable()
export class TfaService {
	constructor(@InjectRepository(User) private userRepo: Repository<User>) {}

	async generateTfaSecret(request: {
		user: User;
		session: Session & Session2FaDTO;
	}): Promise<string> {
		if (!request.user.email) {
			throw new HttpException(
				{
					status: HttpStatus.BAD_REQUEST,
					error: "You can't generate a TFA secret if you have an email.",
				},
				HttpStatus.BAD_REQUEST
			);
		}
		request.user.twofa_secret = authenticator.generateSecret();
		await this.userRepo.save(request.user);
		return authenticator.keyuri(
			request.user.email,
			'ft_transcendance',
			request.user.twofa_secret
		);
	}

	async generateTfaQrCode(otpauthUrl: string) {
		const svgQrCode = await new Promise<string>((resolve, reject) => {
			qrcode.toString(
				otpauthUrl,
				{
					type: 'svg',
					color: { light: '#0000' },
					margin: 0,
				},
				(err, val) => {
					if (err)
						reject(
							new HttpException(
								{
									status: HttpStatus.INTERNAL_SERVER_ERROR,
									error: err,
								},
								HttpStatus.INTERNAL_SERVER_ERROR
							)
						);
					resolve(val);
				}
			);
		});
		return svgQrCode;
	}

	codeChecker(
		request: { user: User; session: Session & Session2FaDTO },
		code: string
	) {
		return authenticator.check(code, request.user.twofa_secret);
	}

	tfaStatusChecker(request: { session: Session2FaDTO }) {
		return request.session.twofa;
	}
}
