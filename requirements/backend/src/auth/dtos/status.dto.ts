import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { UserRole } from "../../user/interface/UserInterface";

export class StatusDTO {

	@ApiProperty({
		description: "Is user logged in",
		example: true,
	})
	loggedIn: boolean;

	@ApiPropertyOptional({
		description: "The user's login",
		example: "tmatis",
	})
	login?: string;

	@ApiPropertyOptional({
		description: "The user's role",
		example: "standard",
	})
	role?: UserRole;
}
