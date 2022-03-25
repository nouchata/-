import { NotificationHandler } from '../../../Providers/NotificationProvider';
import { ChannelDto } from '../../chat/types/user-channels.dto';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGlobe, faKey, faLock } from '@fortawesome/free-solid-svg-icons';
import { useLogin } from '../../../Providers/LoginProvider';
import { ChatSocket, ChatState } from '../../../Providers/ChatProvider';

const ChannelIcon = ({ channel }: { channel: ChannelDto }) => {
	const { loginStatus } = useLogin();

	if (channel.channelType === 'direct') {
		const otherUser = channel.users.find(
			(user) => user.id !== loginStatus.user?.id
		);

		if (otherUser) {
			return (
				<img
                    alt="friend's avatar"
                    src={`${process.env.REACT_APP_BACKEND_ADDRESS}/${otherUser.picture}`}
					className="hsf-content-channel-image"
                />
			);
		}
	}

	if (channel.channelType === 'public') {
		return (
			<FontAwesomeIcon
				icon={faGlobe}
				className="hsf-content-channel-icon"
			/>
		);
	}

	if (channel.channelType === 'protected') {
		return (
			<FontAwesomeIcon
				icon={faKey}
				className="hsf-content-channel-icon"
			/>
		);
	}

	return (
		<FontAwesomeIcon
			icon={faLock}
			className="hsf-content-channel-icon"
		/>
	);
};

const ChannelList = ({
	chatSocket,
	notificationHandler,
	setSelectChannelIndex,
	setChatStatus,
}: {
	chatSocket?: ChatSocket;
	notificationHandler: NotificationHandler;
	setSelectChannelIndex: (index: number) => void;
	setChatStatus: (status: ChatState) => void;
}) => {
	return (
		<ul>
			{chatSocket?.channels.map((channel, index) => {
				return (
					<li
						key={index}
						onClick={() => {
							setSelectChannelIndex(index);
							notificationHandler?.removeNotificationContext(
								'chat'
							);
							setChatStatus({
								state: 'OPENED',
							});
						}}
					>
						<figure>
							<ChannelIcon channel={channel} />
							<figcaption>{channel.name}</figcaption>
						</figure>
					</li>
				);
			})}
		</ul>
	);
};

export default ChannelList;
