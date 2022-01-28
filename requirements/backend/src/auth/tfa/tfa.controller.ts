import { Controller, Req, Get } from "@nestjs/common";
import { ApiResponse, ApiTags } from "@nestjs/swagger";
import { Session } from "express-session";
import { User } from "src/user/entities/user.entity";
import { Session2FaDTO } from "./session-twofa.dto";
import { TfaService } from "./tfa.service";


@Controller('2fa')
export class TfaController {
    constructor(
        private readonly tfaService : TfaService
    ) {}

    @ApiResponse({
		status: 200,
		description: 'Return an SVG as HTML tag to use with Google Authenticator'
	})
    @ApiResponse({
		status: 500,
		description: 'For some reasons, the QR Code hasn\'t been generated'
	})
    @ApiTags('2fa')
    @Get('generate')
    async register(@Req() req: {user: User, session: Session & Session2FaDTO}) : Promise<string> {
        return (this.tfaService.generateTfaQrCode(
            await this.tfaService.generateTfaSecret(req)
        ));
    }
}