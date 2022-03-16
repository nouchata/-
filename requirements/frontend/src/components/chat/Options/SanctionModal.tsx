import {
	faBan,
	faChevronLeft,
	faVolumeXmark,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import DateTimePicker from 'react-datetime-picker';
import { PunishmentType } from '../types/punishment.dto';
import { ChannelDto, User } from '../types/user-channels.dto';
import { IUsePunishment } from '../utils/usePunishment';
import Button from './Button';

const SanctionModal = ({
	punishmentType,
	channel,
	user,
	punishmentsUtil,
	back,
}: {
	punishmentType: PunishmentType;
	channel: ChannelDto;
	user: User;
	punishmentsUtil: IUsePunishment;
	back: () => void;
}) => {
	const [date, setDate] = useState(new Date());

	return (
		<div className="sanction-modal">
			<FontAwesomeIcon
				icon={faChevronLeft}
				className="button-icon"
				onClick={back}
			/>
			<h1>Select time to {punishmentType}</h1>
			<div className="user-info">
				<img
					src={
						(process.env.REACT_APP_BACKEND_ADDRESS as string) +
						'/' +
						user.picture
					}
					alt=""
					className="user-image"
				/>
				<p>{user.displayName}</p>
			</div>
			<DateTimePicker
				onChange={setDate}
				value={date}
				className="date-picker"
			/>
			<Button
				onClick={() => {
					punishmentsUtil.addPunishment({
						userId: user.id,
						channelId: channel.id,
						type: punishmentType,
						expiration: date.toISOString(),
					});
				}}
				className={`confirm ${punishmentType}-button`}
			>
				{punishmentType === 'mute' ? (
					<>
						<FontAwesomeIcon
							icon={faVolumeXmark}
							className="icon"
						/>
						Mute
					</>
				) : (
					<>
						<FontAwesomeIcon icon={faBan} className="icon" />
						Ban
					</>
				)}
			</Button>
		</div>
	);
};

export default SanctionModal;
