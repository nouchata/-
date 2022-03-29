import { User } from '../../../types/User';

export type PunishmentType = 'ban' | 'mute' | 'kick';

export interface PunishmentDto {
	id: number;

	user: User;

	reason?: string;

	admin: string;

	type: PunishmentType;

	expiration?: Date;

	createdAt: Date;
}
