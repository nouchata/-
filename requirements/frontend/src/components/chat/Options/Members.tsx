import { faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useLogin } from '../../../Providers/LoginProvider';
import { useModal } from '../../../Providers/ModalProvider';
import { ChannelDto, User } from '../types/user-channels.dto';
import Button from './Button';
import { BlockButton, FriendButton } from './SocialButtons';

const Member = ({ user }: { user: User }) => {
	const { setModalProps } = useModal();
	const { loginStatus } = useLogin();
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
					<div className="member-status">
						{loginStatus.user?.id !== user.id
							? user.status
							: 'you'}
					</div>
				</div>
			</div>

			{loginStatus.user?.id !== user.id && (
				<div className="buttons">
					<Button
						onClick={() => {
							setModalProps(undefined);
						}}
					>
						<FontAwesomeIcon icon={faUser} className="icon" />
						See profile
					</Button>
					<FriendButton userId={user.id} />
					<BlockButton userId={user.id} />
				</div>
			)}
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
