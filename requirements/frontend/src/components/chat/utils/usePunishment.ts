import { CreatePunishmentDto } from './../types/create-punishment.dto';
import { RequestWrapper } from './../../../utils/RequestWrapper';
import { useEffect, useState } from 'react';
import { PunishmentDto, PunishmentType } from '../types/punishment.dto';

export interface IUsePunishment {
	punishments: PunishmentDto[] | undefined;
	addPunishment: (punishment: CreatePunishmentDto) => void;
	getActivePunishement: (
		userId: number,
		type: PunishmentType
	) => PunishmentDto | undefined;
	getUserPunishments: (userId: number) => PunishmentDto[];
}

const usePunishment = (channelId: number): IUsePunishment => {
	const [punishments, setPunishments] = useState<PunishmentDto[]>();

	useEffect(() => {
		const fetchPunishments = async () => {
			const p = await RequestWrapper.get<PunishmentDto[]>(
				`/channel/punishment/${channelId}`,
				undefined,
				(e: any) => {
					alert(e.message);
				}
			);
			if (p) {
				const parsed = p.map((p) => {
					p.createdAt = new Date(p.createdAt);
					if (p.expiration) {
						p.expiration = new Date(p.expiration);
					}
					return p;
				});
				setPunishments(parsed);
			}
		};
		fetchPunishments();
	}, [channelId]);

	const addPunishment = async (punishment: CreatePunishmentDto) => {
		const p = await RequestWrapper.post<PunishmentDto>(
			'/channel/punishment',
			punishment,
			(e: any) => {
				alert(e.message);
			}
		);
		if (p) {
			const parsed = {
				...p,
				createdAt: new Date(p.createdAt),
				expiration: p.expiration ? new Date(p.expiration) : undefined,
			};
			if (punishments) setPunishments([...punishments, parsed]);
			else setPunishments([parsed]);
		}
	};

	const getActivePunishement = (userId: number, type: PunishmentType) => {
		if (!punishments)
			throw new Error('No punishments, did you wait for fetch ?');
		const userPunishments = punishments.filter((p) => p.user.id === userId);
		const activePunishment = userPunishments.find(
			(p) =>
				p.type === type && (!p.expiration || p.expiration > new Date())
		);
		return activePunishment;
	};

	const getUserPunishments = (userId: number) => {
		if (!punishments)
			throw new Error('No punishments, did you wait for fetch ?');
		return punishments.filter((p) => p.user.id === userId);
	};

	return {
		punishments,
		addPunishment,
		getActivePunishement,
		getUserPunishments,
	};
};

export default usePunishment;
