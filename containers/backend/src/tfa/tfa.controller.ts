import {
	Controller,
	Req,
	Get,
	Post,
	Body,
	HttpException,
	HttpStatus,
	ValidationPipe,
	UseGuards,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { Session } from 'express-session';
import { GroupGuard } from 'src/auth/guards/group.guard';
import { User } from 'src/user/entities/user.entity';
import { CheckerBodyDTO } from './dtos/checker-body.dto';
import { Session2FaDTO } from './dtos/session-2fa.dto';
import { TfaService } from './tfa.service';

@UseGuards(GroupGuard)
@Controller('2fa')
export class TfaController {
	constructor(private readonly tfaService: TfaService) {}

	@ApiResponse({
		status: 200,
		description:
			'Return an SVG as HTML tag to use with Google Authenticator',
	})
	@ApiResponse({
		status: 500,
		description: "For some reasons, the QR Code hasn't been generated",
	})
	@ApiTags('2fa')
	@Get('generate')
	async register(
		@Req() req: { user: User; session: Session & Session2FaDTO }
	): Promise<string> {
		return this.tfaService.generateTfaQrCode(
			await this.tfaService.generateTfaSecret(req)
		);
	}

	@ApiResponse({
		status: 201,
		description: 'The code is correct',
	})
	@ApiResponse({
		status: 400,
		description: "The code isn't correct",
	})
	@ApiTags('2fa')
	@Post('checker')
	validation(
		@Req() req: { user: User; session: Session & Session2FaDTO },
		@Body(new ValidationPipe()) body: CheckerBodyDTO
	) {
		if (this.tfaService.codeChecker(req, body.givenCode))
			req.session.twofa.passed = true;
		else
			throw new HttpException(
				{
					status: HttpStatus.BAD_REQUEST,
					error: 'Your code is either wrong or outdated',
				},
				HttpStatus.BAD_REQUEST
			);
	}

	@ApiResponse({
		status: 200,
		description: 'Give the 2fa status back',
	})
	@ApiTags('2fa')
	@Get('status')
	tfaStatus(@Req() req: { session: Session2FaDTO }) {
		return this.tfaService.tfaStatusChecker(req);
	}
}
