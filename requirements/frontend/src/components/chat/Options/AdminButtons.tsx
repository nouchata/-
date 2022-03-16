import {
	faBan,
	faUserSlash,
	faVolumeXmark,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ChannelDto, User } from '../types/user-channels.dto';
import { IUsePunishment } from '../utils/usePunishment';
import Button from './Button';

const KickButton = ({ channel, user }: { channel: ChannelDto; user: User }) => {
	return (
		<Button onClick={() => {}} className="kick-button">
			<FontAwesomeIcon icon={faUserSlash} className="icon" />
			Kick
		</Button>
	);
};

const MuteButton = ({ channel, user }: { channel: ChannelDto; user: User }) => {
	return (
		<Button onClick={() => {}} className="mute-button">
			<FontAwesomeIcon icon={faVolumeXmark} className="icon" />
			Mute
		</Button>
	);
};

const BanButton = ({ channel, user }: { channel: ChannelDto; user: User }) => {
	return (
		<Button onClick={() => {}} className="ban-button">
			<FontAwesomeIcon icon={faBan} className="icon" />
			Ban
		</Button>
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
		<Button onClick={() => {console.log(punishmentsUtil.getUserPunishments(user.id))}} className="see-sanctions-button">
			<FontAwesomeIcon icon={faBan} className="icon" />
			See sanctions
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
			<MuteButton channel={channel} user={user} />
			<BanButton channel={channel} user={user} />
			<SeeSanctionsButton
				channel={channel}
				user={user}
				punishmentsUtil={punishmentsUtil}
			/>
		</>
	);
};

export default AdminButtons;
