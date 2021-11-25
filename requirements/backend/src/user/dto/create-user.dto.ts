import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";
import { UserInterface, UserRole } from "../interface/UserInterface";

export class CreateUserDTO implements UserInterface
{
	@IsNotEmpty()
	@ApiProperty(
		{
			description: "The login of the user",
			example: "tmatis",
			required: true,
		}
	)
	login: string;
	
	@IsNotEmpty()
	@ApiProperty(
		{
			enum: ['standard', 'moderator', 'admin'],
			description: "The role of the user",
			example: "standard",
			required: true,
		}
	)
	role: UserRole;
}
