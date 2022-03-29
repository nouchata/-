import { faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useLogin } from '../../../../Providers/LoginProvider';
import { useModal } from '../../../../Providers/ModalProvider';
import { FetchFriendsList } from '../../../../types/FetchFriendsList';
import { ChannelDto, User } from '../../types/user-channels.dto';
import { BlockButton, FriendButton } from '../SocialButtons';
import Button from './Button';
import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';

const Member = ({
	user,
	children,
	title,
}: {
	user: FetchFriendsList;
	children?: React.ReactNode;
	title?: string;
}) => {
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
					<div className="member-name">{`${user.displayName} ${
						title || ''
					}`}</div>
					<div className="member-status">
						{loginStatus.user?.id !== user.id ? user.status : 'you'}
					</div>
				</div>
			</div>

			{loginStatus.user?.id !== user.id && (
				<div className="buttons">{children}</div>
			)}
		</div>
	);
};

const Members = ({ channel }: { channel: ChannelDto }) => {
	const { setModalProps } = useModal();
	const nav = useNavigate();

	const getTitle = useCallback(
		(user: User) => {
			if (channel.channelType === 'direct') {
				return undefined;
			}
			if (channel.owner.id === user.id) {
				return '(owner)';
			}
			if (channel.admins.some((admin) => admin.id === user.id)) {
				return '(admin)';
			}
			return undefined;
		},
		[channel]
	);

	return (
		<div className="members">
			{channel.users.map((user, key) => {
				return (
					<Member key={key} user={user} title={getTitle(user)}>
						<Button
							onClick={() => {
								nav(`/profile/${user.id}`);
								setModalProps(undefined);
							}}
						>
							<FontAwesomeIcon icon={faUser} className="icon" />
							See profile
						</Button>
						<FriendButton userId={user.id} />
						<BlockButton userId={user.id} />
					</Member>
				);
			})}
		</div>
	);
};

export { Member, Members };
