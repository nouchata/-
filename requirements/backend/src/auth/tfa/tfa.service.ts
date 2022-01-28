import { ExecutionContext, HttpException, HttpStatus, Injectable, Res } from "@nestjs/common";
import { Session } from "express-session";
import { authenticator } from "otplib";
import * as qrcode from "qrcode";
import { User } from "src/user/entities/user.entity";
import { Session2FaDTO } from "./session-twofa.dto";


@Injectable()
export class TfaService {
    constructor() {}

    async generateTfaSecret(request: {user: User, session: Session & Session2FaDTO}) : Promise<string> {
        request.session.twofa.secret = authenticator.generateSecret();
        return authenticator.keyuri(
            request.user.email,
            "ft_transcendance",
            request.session.twofa.secret
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
};