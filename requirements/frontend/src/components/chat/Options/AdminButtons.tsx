import {
	faBan,
	faUserSlash,
	faVolumeXmark,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import { ChannelDto, User } from '../types/user-channels.dto';
import { IUsePunishment } from '../utils/usePunishment';
import Button from './Button';
import SanctionModal from './SanctionModal';

const KickButton = ({ channel, user }: { channel: ChannelDto; user: User }) => {
	return (
		<Button onClick={() => {}} className="kick-button">
			<FontAwesomeIcon icon={faUserSlash} className="icon" />
			Kick
		</Button>
	);
};

const MuteButton = ({
	channel,
	user,
	punishmentsUtil,
}: {
	channel: ChannelDto;
	user: User;
	punishmentsUtil: IUsePunishment;
}) => {
	const [modalOpen, setModalOpen] = useState(false);

	return (
		<>
			<Button
				onClick={() => {
					setModalOpen(true);
				}}
				className="mute-button"
			>
				<FontAwesomeIcon icon={faVolumeXmark} className="icon" />
				Mute
			</Button>
			{modalOpen && (
				<SanctionModal
					punishmentType={'mute'}
					channel={channel}
					user={user}
					punishmentsUtil={punishmentsUtil}
					back={() => {
						setModalOpen(false);
					}}
					setModalOpen={setModalOpen}
				/>
			)}
		</>
	);
};

const BanButton = ({
	channel,
	user,
	punishmentsUtil,
}: {
	channel: ChannelDto;
	user: User;
	punishmentsUtil: IUsePunishment;
}) => {
	const [modalOpen, setModalOpen] = useState(false);

	return (
		<>
			<Button
				onClick={() => {
					setModalOpen(true);
				}}
				className="ban-button"
			>
				<FontAwesomeIcon icon={faBan} className="icon" />
				Ban
			</Button>
			{modalOpen && (
				<SanctionModal
					punishmentType="ban"
					channel={channel}
					user={user}
					punishmentsUtil={punishmentsUtil}
					back={() => {
						setModalOpen(false);
					}}
					setModalOpen={setModalOpen}
				/>
			)}
		</>
	);
};

const SeeSanctionsButton = ({
	channel,
	user,
	punishmentsUtil,
}: {
	channel: ChannelDto;
	user: User;
	punishmentsUtil: IUsePunishment;
}) => {
	return (
		<Button
			onClick={() => {
				console.log(punishmentsUtil.getUserPunishments(user.id));
			}}
			className="see-sanctions-button"
		>
			<FontAwesomeIcon icon={faBan} className="icon" />
			See sanctions log
		</Button>
	);
};

const AdminButtons = ({
	channel,
	user,
	punishmentsUtil,
}: {
	channel: ChannelDto;
	user: User;
	punishmentsUtil: IUsePunishment;
}) => {
	return (
		<>
			<KickButton channel={channel} user={user} />
			<MuteButton
				channel={channel}
				user={user}
				punishmentsUtil={punishmentsUtil}
			/>
			<BanButton
				channel={channel}
				user={user}
				punishmentsUtil={punishmentsUtil}
			/>
			{punishmentsUtil.getUserPunishments(user.id).length > 0 && (
				<SeeSanctionsButton
					channel={channel}
					user={user}
					punishmentsUtil={punishmentsUtil}
				/>
			)}
		</>
	);
};

export default AdminButtons;
