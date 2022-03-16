import { User } from "../../../types/User";

export type PunishmentType = 'ban' | 'mute';

export interface PunishmentDto {
	id: number;

	user: User;

	reason?: string;

	type: PunishmentType;

	expiration?: Date;

	createdAt: Date;
}