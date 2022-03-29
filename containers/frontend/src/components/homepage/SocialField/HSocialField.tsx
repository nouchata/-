import { useState, useEffect, useCallback } from 'react';

import '../../../styles/social_field.scss';
import '../styles/Chat.scss';

import chatImage from '../../../assets/homepage/chat.png';

import { ChannelDto, MessageDto } from '../../chat/types/user-channels.dto';
import FriendsList from '../../friends/FriendsList';
import AddFriendModal from '../../friends/modal/AddFriendModal';
import { useModal } from '../../../Providers/ModalProvider';
import { useFriendList } from '../../../Providers/FriendListProvider';
import { useNotificationHandler } from '../../../Providers/NotificationProvider';
import ChannelList from './ChannelList';
import NewConv from './NewConv';
import ChatBox from './ChatBox';
import { useNavigate } from 'react-router-dom';
import { useChat } from '../../../Providers/ChatProvider';
import { useLogin } from '../../../Providers/LoginProvider';

const HSocialField = (props: { standalone?: boolean }) => {
	const [isFriendTabSelected, setIsFriendTabSelected] =
		useState<boolean>(false);
	const [isSocialFieldShowed, setIsSocialFieldShowed] =
		useState<boolean>(true);
	const { setModalProps } = useModal();
	const {
		chatSocket,
		selectedChannelIndex,
		setSelectedChannelIndex,
		chatStatus,
		setChatStatus,
	} = useChat();
	const friendList = useFriendList();
	const notificationHandler = useNotificationHandler();
	const navigate = useNavigate();
	const {loginStatus} = useLogin()

	const onMessage = useCallback(
		(message: MessageDto, channel: ChannelDto) => {
			if (message.userId === loginStatus.user?.id)
				return ;
			// find user in channel.users by id
			const user = channel.users.find((u) => u.id === message.userId);

			notificationHandler?.addNotification({
				name:
					channel.channelType === 'direct'
						? 'Direct message'
						: channel.name,
				content: `${user ? user.displayName : 'system'}: ${
					message.text
				}`,
				image: chatImage,
				context: 'chat',
				openAction: (windowWidth?: number) => {
					if (windowWidth && windowWidth < 800)
						navigate(`/social?id=${channel.id}`);
					else setChatStatus({ state: 'OPENED' });
				},
			});
		},
		[loginStatus.user?.id, navigate, notificationHandler, setChatStatus]
	);

	useEffect(() => {
		if (chatSocket) {
			chatSocket.onMessage = onMessage;
		}
	}, [notificationHandler, chatSocket, onMessage]);

	const AddFriend = async (name: string) => {
		try {
			await friendList.addFriendByName(name);
		} catch (e: any) {
			console.log('error caught');
			let errinfo: string;
			console.log(e.response.data);
			if (e.response.data.message) {
				errinfo = e.response.data.message;
			} else {
				errinfo = 'Unexpected Error :(';
			}
			setModalProps({
				show: true,
				content: <AddFriendModal cb={AddFriend} info={errinfo} />,
			});
		}
	};

	return (
		<div
			className="social-field"
			style={{
				height: props.standalone ? '100%' : undefined,
				maxWidth: props.standalone ? '100%' : undefined,
			}}
		>
			{!props.standalone && (
				<button
					title={
						isSocialFieldShowed
							? 'Hide social panel'
							: 'Show social panel'
					}
					onClick={() => {
						socialToggleCSS(isSocialFieldShowed);
						setIsSocialFieldShowed(!isSocialFieldShowed);
					}}
				>
					{isSocialFieldShowed ? '<' : '>'}
				</button>
			)}
			<TabSelector
				isFriendTabSelected={isFriendTabSelected}
				setIsFriendTabSelected={setIsFriendTabSelected}
			/>
			<div className="hsf-content">
				{isFriendTabSelected ? (
					<FriendsList />
				) : (
					<ChannelList
						chatSocket={chatSocket}
						setSelectChannelIndex={setSelectedChannelIndex}
						notificationHandler={notificationHandler}
						setChatStatus={setChatStatus}
					/>
				)}
			</div>
			{chatSocket?.channels[selectedChannelIndex] && (
				<ChatBox
					chatStatus={chatStatus}
					chatSocket={chatSocket}
					selectChannelIndex={selectedChannelIndex}
					setChatStatus={setChatStatus}
				/>
			)}
			<NewConv
				chatSocket={chatSocket}
				isFriendTabSelected={isFriendTabSelected}
				AddFriend={AddFriend}
			/>
		</div>
	);
};

function socialToggleCSS(isShowed: boolean): void {
	let elem: HTMLElement | null = document.querySelector('.main-content');
	if (!elem) return;
	elem.style.animation = 'none';
	setTimeout(() => {
		if (elem) {
			if (isShowed) {
				elem.style.animation =
					'1s ease-in-out 0s 1 normal both running hsf-slide';
			} else {
				elem.style.animation =
					'1s ease-in-out 0s 1 reverse both running hsf-slide';
			}
		}
	}, 0);
}

export default HSocialField;

function TabSelector({
	isFriendTabSelected,
	setIsFriendTabSelected,
}: {
	isFriendTabSelected: boolean;
	setIsFriendTabSelected: (isFriendTabSelected: boolean) => void;
}) {
	return (
		<div className="hsf-tab-selector">
			<button
				className={isFriendTabSelected ? 'hsf-btn-selected' : ''}
				onClick={() =>
					!isFriendTabSelected && setIsFriendTabSelected(true)
				}
			>
				Friends
			</button>
			<button
				className={!isFriendTabSelected ? 'hsf-btn-selected' : ''}
				onClick={() =>
					isFriendTabSelected && setIsFriendTabSelected(false)
				}
			>
				Channels
			</button>
		</div>
	);
}
