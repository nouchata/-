import { useState, useEffect, useCallback } from 'react';


import '../../../styles/social_field.scss';
import '../styles/Chat.scss';

import chatImage from '../../../assets/homepage/chat.png';

import { RequestWrapper } from '../../../utils/RequestWrapper';
import { ChannelDto, MessageDto } from '../../chat/types/user-channels.dto';
import { ChatSocket } from '../../chat/utils/ChatSocket';
import FriendsList from '../../friends/FriendsList';
import AddFriendModal from '../../friends/modal/AddFriendModal';
import { useModal } from '../../../Providers/ModalProvider';
import { useLogin } from '../../../Providers/LoginProvider';
import { useFriendList } from '../../../Providers/FriendListProvider';
import { useNotificationHandler } from '../../../Providers/NotificationProvider';
import ChannelList from './ChannelList';
import NewConv from './NewConv';
import ChatBox from './ChatBox';
import { useNavigate } from 'react-router-dom';


export type ChatState = {
	state: 'OPENED' | 'MINIMIZED' | 'CLOSED';
};

const HSocialField = (props: { standalone?: boolean }) => {
	const [isFriendTabSelected, setIsFriendTabSelected] =
		useState<boolean>(false);
	const [chatStatus, setChatStatus] = useState<ChatState>({
		state: 'CLOSED',
	});
	const [isSocialFieldShowed, setIsSocialFieldShowed] =
		useState<boolean>(true);
	const { setModalProps } = useModal();
	const [chatSocket, setChatSocket] = useState<ChatSocket>();
	const [selectChannelIndex, setSelectChannelIndex] = useState<number>(0);
	const { loginStatus } = useLogin();
	const friendList = useFriendList();
	const notificationHandler = useNotificationHandler();
	const navigate = useNavigate();


	const onMessage = useCallback(
		(message: MessageDto, channel: ChannelDto) => {
			// find user in channel.users by id
			const user = channel.users.find((u) => u.id === message.userId);

			notificationHandler?.addNotification({
				name: channel.channelType === 'direct' ? 'Direct message' : channel.name,
				content: `${user ? user.displayName : 'system'}: ${
					message.text
				}`,
				image: chatImage,
				context: 'chat',
				openAction: (windowWidth?: number) => {
					if (windowWidth && windowWidth < 800)
						navigate(`/social?id=${channel.id}`);
					else
						setChatStatus({ state: 'OPENED' });
				},
			});
		},
		[notificationHandler] // eslint-disable-line
	);

	useEffect(() => {
		const fetchChannels = async () => {
			const channels = await RequestWrapper.get<ChannelDto[]>(
				'/user/channels/list'
			);
			channels &&
				setChatSocket(
					new ChatSocket(
						channels,
						{
							setChatSocket,
							onMessage,
						},
						loginStatus.user
					)
				);
		};
		fetchChannels();
		// eslint-disable-next-line
	}, [loginStatus.user]);

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
		<div className="social-field" style={{ height: props.standalone ? "100%" : undefined, maxWidth: props.standalone ? "100%" : undefined }}>
			{!props.standalone && <button
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
			</button>}
			<TabSelector
				isFriendTabSelected={isFriendTabSelected}
				setIsFriendTabSelected={setIsFriendTabSelected}
			/>
			<div className="hsf-content">
				{isFriendTabSelected ? (
					<FriendsList setModal={setModalProps} />
				) : (
					<ChannelList
						chatSocket={chatSocket}
						setSelectChannelIndex={setSelectChannelIndex}
						notificationHandler={notificationHandler}
						setChatStatus={setChatStatus}
					/>
				)}
			</div>
			{chatSocket?.channels[selectChannelIndex] && (
				<ChatBox
					chatStatus={chatStatus}
					chatSocket={chatSocket}
					selectChannelIndex={selectChannelIndex}
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
	if (!elem)
		return ;
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