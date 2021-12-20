import { UserRole } from "../components/chat/types/user-channels.dto";

export interface User {

	id: number;
	login: string;
	picture: string;
	role: UserRole;
	displayName: string;
	profileURL: string;
	email?: string;
	createdAt: Date;
	elo: number;
	victories: number;
	losses: number;
	friends: User[];
}
