import { useState, useContext, useEffect, useCallback, useMemo } from 'react';
import LoginContext from '../../contexts/LoginContext';
import ModalContext from '../../contexts/ModalContext';

import CloseAsset from '../../assets/chat/close.png';
import MinusAsset from '../../assets/chat/minus.png';
import ContainMaxAsset from '../../assets/chat/contain-max.png';
import HashAsset from '../../assets/social/hashtag.png';
import chatImage from '../../assets/homepage/chat.png';

import '../../styles/social_field.scss';
import './styles/Chat.scss';

import { RequestWrapper } from '../../utils/RequestWrapper';
import { ChannelDto, MessageDto } from '../chat/types/user-channels.dto';
import { ChatSocket } from '../chat/utils/ChatSocket';
import { FetchStatusData } from '../../types/FetchStatusData';
import InputChat from '../chat/InputChat';
import MessageArea from '../chat/MessageArea';
import NotificationContext from '../../contexts/NotificationContext';
import { GenericModalProps } from '../utils/GenericModal';
import FriendsList from '../friends/FriendsList';
import JoinCreateModal from '../chat/modal/JoinCreateModal';
import ChatOption from '../chat/Options/ChatOption';
import AddFriendModal from '../friends/modal/AddFriendModal';
import { FetchFriendsList } from '../../types/FetchFriendsList';

type ChatState = {
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
	const { setModalProps } = useContext(ModalContext);
	const [chatSocket, setChatSocket] = useState<ChatSocket>();
	const [selectChannelIndex, setSelectChannelIndex] = useState<number>(0);
	const [friends, setFriends] = useState<FetchFriendsList[]>([]);
	const fetchStatusValue: {
		fetchStatus: FetchStatusData;
		setFetchStatus: (fetchStatus: FetchStatusData) => void;
	} = useContext(LoginContext);
	let notificationHandler = useContext(NotificationContext);

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

	const existingChannels = useMemo(() => {
		if (!chatSocket) return [];
		return chatSocket?.channels.map((channel) => channel.id);
	}, [chatSocket]);

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
						fetchStatusValue.fetchStatus.user
					)
				);
		};
		fetchChannels();
		// eslint-disable-next-line
	}, [fetchStatusValue.fetchStatus.user]);

	useEffect(() => {
		if (chatSocket) {
			chatSocket.onMessage = onMessage;
		}
	}, [notificationHandler, chatSocket, onMessage]);

	const AddFriend = async (name: string) => {
		const data = await RequestWrapper.post<FetchFriendsList>(
			'/user/friends/add',
			{ username: name },
			(e) => {
				let errinfo: string;
				if (e.response) {
					errinfo = e.response.data.message;
				} else {
					errinfo = 'Unexpected Error :(';
				}
				setModalProps({ show: true, content: <AddFriendModal cb={AddFriend} info={errinfo} /> })
		});
		if (data) {
			friends.push(data);
			setFriends(friends);
			setModalProps({ show: false });
		}
	}

	const friendModalSettings: GenericModalProps = {
		show: true,
		content: <AddFriendModal cb={AddFriend}/>,
		width: '25%'
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
			<div className='hsf-content'>
				{isFriendTabSelected ?
					<FriendsList friends={{ val: friends, set: setFriends }} setModal={setModalProps} /> :
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
										setChatStatus({ state: 'OPENED' });
									}}
								>
									<figure>
										<img
											src={HashAsset}
											alt="Message Tab"
											className="hsf-content-channel-img"
										/>
										<figcaption>{channel.name}</figcaption>
									</figure>
								</li>
							);
						})}
					</ul>
				}
			</div>
			{chatSocket?.channels[selectChannelIndex] && (
				<div className={chatToggleCSS(chatStatus)}>
					<div className="hsf-chat-controls">
						<h2>{chatSocket?.channels[selectChannelIndex].name}</h2>
						<ChatOption channel={chatSocket.channels[selectChannelIndex]} />
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
			<div className="hsf-btn-new">
				<button
					onClick={() => {
						if (!chatSocket) return;
						setModalProps(
							isFriendTabSelected
								? friendModalSettings
								: {
										show: true,
										content: (
											<JoinCreateModal
												socket={chatSocket}
												existingChannels={
													existingChannels
												}
											/>
										),
										height: '50%',
										width: '85%',
										maxWidth: '500px',
								  }
						);
					}}
				>
					+{' '}
					{isFriendTabSelected
						? 'Add a new friend'
						: 'Create a new discussion'}
				</button>
			</div>
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
