import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from 'src/user/entities/user.entity';

enum LoginState {
	NOT_LOGGED,
	PARTIAL,
	LOGGED,
}

class StatusDTO {
	@ApiProperty({
		description: 'Is user logged in',
	})
	loggedIn: LoginState;

	@ApiPropertyOptional({
		description: 'The user object',
		type: User,
	})
	user?: User;
}

export { StatusDTO, LoginState };
