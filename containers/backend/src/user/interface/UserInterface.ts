import { MatchHistory } from '../entities/match-history.entity';
import { User } from '../entities/user.entity';

export type UserStatus = 'online' | 'offline' | 'ingame';

export interface UserInterface {
	login: string;
	displayName: string;
	email?: string;
	picture?: string;
	elo?: number;
	losses?: number;
	history?: MatchHistory[];
	friends?: User[];
}
