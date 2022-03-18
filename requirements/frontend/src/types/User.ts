import { UserRole } from "../components/chat/types/user-channels.dto";
import { UserStatus } from "../components/utils/StatusDisplay";

interface IObjectKeys {
	[key: string]: any;
}

export interface User extends IObjectKeys {
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
	history: string[];
	twofa: boolean;
	status: UserStatus;
}
