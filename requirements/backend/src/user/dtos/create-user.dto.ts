import { UserInterface, UserRole } from "../interface/UserInterface";

export class CreateUserDTO implements UserInterface
{
	login: string;
	role: UserRole;
}
