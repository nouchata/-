import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { User } from "src/user/entities/user.entity";

export class StatusDTO {

	@ApiProperty({
		description: "Is user logged in",
		example: true,
	})
	loggedIn: boolean;

	@ApiPropertyOptional({
		description: "The user object",
		type: User,
	})
	user?: User;
}
