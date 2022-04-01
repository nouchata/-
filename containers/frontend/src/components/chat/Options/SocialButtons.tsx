import { faBan, faUserMinus, faUserPlus, faGlasses } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useBlocked } from '../../../Providers/BlockedProvider';
import { useFriendList } from '../../../Providers/FriendListProvider';
import Button from './utils/Button';
import './SocialButtons.scss';
import { useNavigate } from 'react-router-dom';

const BlockButton = ({ userId }: { userId: number }) => {
	const blockedHook = useBlocked();

	return (
		<Button
			onClick={() => {
				blockedHook.isBlocked(userId)
					? blockedHook.removeBlocked(userId)
					: blockedHook.addBlocked(userId);
			}}
			className="block-button"
		>
			<FontAwesomeIcon icon={faBan} className="icon" />
			{blockedHook.isBlocked(userId) ? 'Unblock' : 'Block'}
		</Button>
	);
};

const FriendButton = ({ userId }: { userId: number }) => {
	const friendList = useFriendList();

	return (
		<Button
			onClick={() => {
				friendList.isFriend(userId)
					? friendList.removeFriend(userId)
					: friendList.addFriend(userId);
			}}
			className="friend-button"
		>
			{friendList.isFriend(userId) ? (
				<>
					<FontAwesomeIcon icon={faUserMinus} className="icon" />
					Remove friend
				</>
			) : (
				<>
					<FontAwesomeIcon icon={faUserPlus} className="icon" />
					Add friend
				</>
			)}
		</Button>
	);
};

const WatchButton = (props: { instanceId: number, self?: boolean }) => {
	const navigate = useNavigate();
	const url = "/game?play=" + String(props.instanceId) + "&forceSpectator=1";

	return (
		<Button
			onClick={() => navigate(url)}
			className="watch-button"
		>
			<FontAwesomeIcon icon={faGlasses} className="icon" />
			Watch match
		</Button>
	);
};

export { BlockButton, FriendButton, WatchButton };
