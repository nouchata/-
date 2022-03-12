import { useState, useEffect, useCallback } from 'react';

import CloseAsset from '../../../assets/chat/close.png';
import MinusAsset from '../../../assets/chat/minus.png';
import ContainMaxAsset from '../../../assets/chat/contain-max.png';
import chatImage from '../../../assets/homepage/chat.png';

import '../../../styles/social_field.scss';
import '../styles/Chat.scss';

import { RequestWrapper } from '../../../utils/RequestWrapper';
import { ChannelDto, MessageDto } from '../../chat/types/user-channels.dto';
import { ChatSocket } from '../../chat/utils/ChatSocket';
import InputChat from '../../chat/InputChat';
import MessageArea from '../../chat/MessageArea';
import FriendsList from '../../friends/FriendsList';
import ChatOption from '../../chat/Options/ChatOption';
import AddFriendModal from '../../friends/modal/AddFriendModal';
import { useModal } from '../../../Providers/ModalProvider';
import { useLogin } from '../../../Providers/LoginProvider';
import { useFriendList } from '../../../Providers/FriendListProvider';
import {
	useNotificationHandler,
} from '../../../Providers/NotificationProvider';
import ChannelList from './ChannelList';
import NewConv from './NewConv';

export type ChatState = {
	state: 'OPENED' | 'MINIMIZED' | 'CLOSED';
};

const HSocialField = () => {
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

	const onMessage = useCallback(
		(message: MessageDto, channel: ChannelDto) => {
			// find user in channel.users by id
			const user = channel.users.find((u) => u.id === message.userId);

			notificationHandler?.addNotification({
				name: channel.name,
				content: `${user ? user.displayName : 'system'}: ${
					message.text
				}`,
				image: chatImage,
				context: 'chat',
				openAction: () => {
					setChatStatus({ state: 'OPENED' });
				},
			});
		},
		[notificationHandler]
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
			console.log(errinfo);
			setModalProps({
				show: true,
				content: <AddFriendModal cb={AddFriend} info={errinfo} />,
			});
		}
	};

	return (
		<div className="social-field">
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
				<div className={chatToggleCSS(chatStatus)}>
					<div className="hsf-chat-controls">
						<h2>{chatSocket?.channels[selectChannelIndex].name}</h2>
						<ChatOption
							channel={chatSocket.channels[selectChannelIndex]}
						/>
						{chatStatus.state === 'OPENED' ? (
							<button
								title="Minimize"
								onClick={() =>
									setChatStatus({ state: 'MINIMIZED' })
								}
							>
								<img src={MinusAsset} alt="minimize" />
							</button>
						) : (
							<button
								title="Maximize"
								onClick={() =>
									setChatStatus({ state: 'OPENED' })
								}
							>
								<img src={ContainMaxAsset} alt="maximize-in" />
							</button>
						)}

						<button
							title="Close"
							onClick={() => setChatStatus({ state: 'CLOSED' })}
						>
							<img src={CloseAsset} alt="close" />
						</button>
					</div>
					<div className="hsf-chat-container">
						<MessageArea
							index={selectChannelIndex}
							chatSocket={chatSocket}
						/>
						<InputChat
							selectChannelIndex={selectChannelIndex}
							sendMessage={(text, channelIndex) =>
								chatSocket?.sendMessage(text, channelIndex)
							}
						/>
					</div>
				</div>
			)}
			<NewConv
				chatSocket={chatSocket}
				isFriendTabSelected={isFriendTabSelected}
				AddFriend={AddFriend}
			/>
		</div>
	);
};

function chatToggleCSS(cs: ChatState): string {
	let ret: string = 'hsf-chat';
	switch (cs.state) {
		case 'MINIMIZED':
			ret += ' minimize-state';
			break;
		case 'CLOSED':
			ret += ' closed-state';
			break;
	}
	return ret;
}

function socialToggleCSS(isShowed: boolean): void {
	let elem: Element | null = document.querySelector('.main-content');
	(elem as HTMLElement).style.animation = 'none';
	setTimeout(() => {
		if (elem) {
			if (isShowed) {
				(elem as HTMLElement).style.animation =
					'1s ease-in-out 0s 1 normal both running hsf-slide';
			} else {
				(elem as HTMLElement).style.animation =
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

