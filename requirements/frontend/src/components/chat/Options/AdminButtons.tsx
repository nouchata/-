import {
	faBan,
	faUserSlash,
	faVolumeXmark,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ChannelDto, User } from '../types/user-channels.dto';
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

export { KickButton, MuteButton, BanButton };
