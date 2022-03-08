import { faBan, faUser, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useContext } from 'react';
import ModalContext from '../../../contexts/ModalContext';
import { ChannelDto, User } from '../types/user-channels.dto';
import { useBlocked } from '../utils/BlockedHook';
import Button from './Button';

const Member = ({user}: {user: User}) => {
	const { setModalProps } = useContext(ModalContext);
	const blockedHook = useBlocked();

	return (
		<div className="member" key={user.id}>
			<div className="user-infos">
				<div className="member-image">
					<img
						src={
							(process.env.REACT_APP_BACKEND_ADDRESS as string) +
							'/' +
							user.picture
						}
						alt=""
					/>
				</div>
				<div>
					<div className="member-name">{user.displayName}</div>
					<div className="member-status">{user.status}</div>
				</div>
			</div>

			<div className="buttons">
				<Button
					onClick={() => {
						setModalProps(undefined);
					}}
				>
					<FontAwesomeIcon icon={faUser} className="icon" />
					See profile
				</Button>
				<Button onClick={() => {}} className="friend-button">
					<FontAwesomeIcon icon={faUserPlus} className="icon" />
					Add to friends
				</Button>
				<Button onClick={() => {
					blockedHook.isBlocked(user.id) ? blockedHook.removeBlocked(user.id) : blockedHook.addBlocked(user.id);
				}} className="block-button">
					<FontAwesomeIcon icon={faBan} className="icon" />
					{blockedHook.isBlocked(user.id) ? 'Unblock' : 'Block'}
				</Button>
			</div>
		</div>
	);
};

const Members = ({ channel }: { userId: number; channel: ChannelDto }) => {
	return (
		<div className="members">
			{channel.users.map((user, key) => {
				return <Member key={key} user={user} />;
			})}
		</div>
	);
};

export default Members;

