import { useState } from 'react';
import { FetchFriendsList } from '../../types/FetchFriendsList';
import StatusDisplay from '../utils/StatusDisplay';

import UserAsset from '../../assets/homepage/user.png';
import ChatAsset from '../../assets/homepage/chat.png';
import RemoveAsset from '../../assets/chat/close.png';
import { useNavigate } from 'react-router-dom';
import { useModal } from '../../Providers/ModalProvider';
import { useFriendList } from '../../Providers/FriendListProvider';
import ConfirmRemoveModal from './modal/ConfirmRemoveModal';
import { useChat } from '../../Providers/ChatProvider';
import { RequestWrapper } from '../../utils/RequestWrapper';
import { DirectChannel } from '../chat/types/user-channels.dto';
import { useNotificationHandler } from '../../Providers/NotificationProvider';

interface IProps {
	data: FetchFriendsList;
}

const FriendRow = (props: IProps) => {
	const [buttonVisible, setButtonVisible] = useState(false);
	const nav = useNavigate();
	const { setModalProps } = useModal();
	const friendList = useFriendList();
	const chat = useChat();
    const notifs = useNotificationHandler();

	const removeFriend = (friend: FetchFriendsList) => {
		const userConfirm = async (confirmed: boolean) => {
			if (confirmed) {
				friendList.removeFriend(friend.id);
			}
			setModalProps(undefined);
		};

		setModalProps({
			show: true,
			content: (
				<ConfirmRemoveModal
					name={friend.displayName}
					cb={userConfirm}
				/>
			),
			width: '40%',
			maxWidth: '500px',
		});
	};

	const sendDirectMessage = async (friend: FetchFriendsList) => {
		if (!chat.chatSocket) return;
		// first we check if a channel exists
		const found = chat.chatSocket.channels.find(
			(c) =>
				c.channelType === 'direct' &&
				c.users.find((u) => u.id === friend.id)
		);
		// if found we set the channel as selected
		if (found) {
			const index = chat.chatSocket.channels.indexOf(found);
            console.log(index);
			if (index !== -1)
            {
                chat.setSelectedChannelIndex(index);
                chat.setChatStatus({ state: 'OPENED' });
            }
            return;
		}
        // if not found we create a new channel
        // POST /channel/direct/:userId
        const newChannel = await RequestWrapper.post<DirectChannel>(`/channel/direct/${friend.id}`, undefined,
        (e) => {
            notifs.addNotification({
				name: 'Error',
				content: e.response?.data?.message || 'Unknown error',
				context: 'error',
			});
        });
        if (newChannel) {
            chat.chatSocket.addChannel(newChannel);
            chat.setSelectedChannelIndex(chat.chatSocket.channels.length - 1);
            chat.setChatStatus({ state: 'OPENED' });
        }

	};

	return (
		<li
			className="friend-row"
			onMouseEnter={() => {
				setButtonVisible(true);
			}}
			onMouseLeave={() => {
				setButtonVisible(false);
			}}
		>
			<div className="friend-picture">
				<img
					alt="friend's avatar"
					src={`${process.env.REACT_APP_BACKEND_ADDRESS}/${props.data.picture}`}
				/>
			</div>

			<div className="friend-info">
				<h3>{props.data.displayName}</h3>
				<StatusDisplay status={props.data.status} />
			</div>

			{buttonVisible ? (
				<div className="friend-buttons">
					<img
						src={UserAsset}
						alt="profile page"
						onClick={() => {
							nav(`/profile/${props.data.id}`);
						}}
					/>
					<img
						src={ChatAsset}
						alt="send a message"
						onClick={() => {
							sendDirectMessage(props.data);
						}}
					/>
					<img
						src={RemoveAsset}
						alt="remove friend"
						onClick={() => {
							removeFriend(props.data);
						}}
					/>
				</div>
			) : null}
		</li>
	);
};

export default FriendRow;
