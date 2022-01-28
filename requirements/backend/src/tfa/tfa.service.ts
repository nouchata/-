import { ExecutionContext, HttpException, HttpStatus, Injectable, Res } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Session } from "express-session";
import { authenticator } from "otplib";
import * as qrcode from "qrcode";
import { User } from "src/user/entities/user.entity";
import { Repository } from "typeorm";
import { Session2FaDTO } from "./dtos/session-2fa.dto";


@Injectable()
export class TfaService {
    constructor(@InjectRepository(User) private userRepo: Repository<User>) {}

    async generateTfaSecret(request: {user: User, session: Session & Session2FaDTO}) : Promise<string> {
        request.user.twofa_secret = authenticator.generateSecret();
        await this.userRepo.save(request.user);
        return authenticator.keyuri(
            request.user.email,
            "ft_transcendance",
            request.user.twofa_secret
        );
    }

    generateTfaQrCode(otpauthUrl: string) {
        let svgQrCode: string;
        qrcode.toString(otpauthUrl, { type: 'svg' }, (err, val) => {
            if (err)
                throw new HttpException({
                    status: HttpStatus.INTERNAL_SERVER_ERROR,
                    error: err.message
                }, HttpStatus.INTERNAL_SERVER_ERROR);
            svgQrCode = val;
        });
        return (svgQrCode);
    }

    codeChecker(request: {user: User, session: Session & Session2FaDTO}, code: string) {
        return authenticator.check(code, request.user.twofa_secret);
    }
};