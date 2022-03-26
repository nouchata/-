import { PunishmentType } from "./punishment.dto";

export interface CreatePunishmentDto {
	userId: number;

	channelId: number;

	reason?: string;

	type: PunishmentType;

	expiration?: string;
}
