import { CreatePunishmentDto } from './../types/create-punishment.dto';
import { RequestWrapper } from './../../../utils/RequestWrapper';
import { useEffect, useState } from 'react';
import { PunishmentDto, PunishmentType } from '../types/punishment.dto';
import axios from 'axios';
import { useNotificationHandler } from '../../../Providers/NotificationProvider';

export interface IUsePunishment {
	punishments: PunishmentDto[] | undefined;
	addPunishment: (punishment: CreatePunishmentDto) => Promise<void>;
	getActivePunishement: (
		userId: number,
		type: PunishmentType
	) => PunishmentDto | undefined;
	getUserPunishments: (userId: number) => PunishmentDto[];
	expirePunishementType: (
		userId: number,
		type: PunishmentType
	) => Promise<void>;
	getAllActivePunishmentsType: (type: PunishmentType) => PunishmentDto[];
}

const usePunishment = (channelId: number): IUsePunishment => {
	const [punishments, setPunishments] = useState<PunishmentDto[]>();
	const notificationHandler = useNotificationHandler();

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
		const p = (
			await axios.post<PunishmentDto>(
				process.env.REACT_APP_BACKEND_ADDRESS + '/channel/punishment',
				punishment,
				{ withCredentials: true }
			)
		).data;
		const parsed = {
			...p,
			createdAt: new Date(p.createdAt),
			expiration: p.expiration ? new Date(p.expiration) : undefined,
		};
		if (punishments) setPunishments([...punishments, parsed]);
		else setPunishments([parsed]);
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

	const expirePunishementType = async (
		userId: number,
		type: PunishmentType
	) => {
		if (!punishments)
			throw new Error('No punishments, did you wait for fetch ?');
		// DELETE /punishment/:channelId/:userId/:punishmentType
		await RequestWrapper.delete(
			`/channel/punishment/${channelId}/${userId}/${type}`,
			(e: any) => {
				notificationHandler.addNotification({
					name: 'Error',
					content: e.response?.data?.message || 'Unknown error',
					context: 'error',
				});
			}
		);
		setPunishments(
			punishments.map((p) => {
				if (p.user.id === userId && p.type === type) {
					p.expiration = new Date();
				}
				return p;
			})
		);
	};

	const getAllActivePunishmentsType = (type: PunishmentType) => {
		if (!punishments)
			throw new Error('No punishments, did you wait for fetch ?');
		return punishments.filter(
			(p) =>
				p.type === type && (!p.expiration || p.expiration > new Date())
		);
	}


	return {
		punishments,
		addPunishment,
		getActivePunishement,
		getUserPunishments,
		expirePunishementType,
		getAllActivePunishmentsType
	};
};

export default usePunishment;
