import InputChat from '../../chat/InputChat';
import MessageArea from '../../chat/MessageArea';
import ChatOption from '../../chat/Options/ChatOption';
import { ChatSocket } from '../../chat/utils/ChatSocket';
import { ChatState } from './HSocialField';

import CloseAsset from '../../../assets/chat/close.png';
import MinusAsset from '../../../assets/chat/minus.png';
import ContainMaxAsset from '../../../assets/chat/contain-max.png';


const ChatControl = ({
	chatSocket,
	selectChannelIndex,
	chatStatus,
	setChatStatus,
}: {
	chatSocket: ChatSocket;
	selectChannelIndex: number;
	chatStatus: ChatState;
	setChatStatus: (chatStatus: ChatState) => void;
}) => {
	return (
		<div className="hsf-chat-controls">
			<h2>{chatSocket?.channels[selectChannelIndex].name}</h2>
			<ChatOption channel={chatSocket.channels[selectChannelIndex]} />
			{chatStatus.state === 'OPENED' ? (
				<button
					title="Minimize"
					onClick={() =>
						setChatStatus({
							state: 'MINIMIZED',
						})
					}
				>
					<img src={MinusAsset} alt="minimize" />
				</button>
			) : (
				<button
					title="Maximize"
					onClick={() =>
						setChatStatus({
							state: 'OPENED',
						})
					}
				>
					<img src={ContainMaxAsset} alt="maximize-in" />
				</button>
			)}

			<button
				title="Close"
				onClick={() =>
					setChatStatus({
						state: 'CLOSED',
					})
				}
			>
				<img src={CloseAsset} alt="close" />
			</button>
		</div>
	);
};

const chatToggleCSS = (cs: ChatState) => {
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
};

const ChatBox = ({
	chatStatus,
	chatSocket,
	selectChannelIndex,
	setChatStatus,
}: {
	chatStatus: ChatState;
	chatSocket: ChatSocket;
	selectChannelIndex: number;
	setChatStatus: (chatStatus: ChatState) => void;
}) => {
	return (
		<div className={chatToggleCSS(chatStatus)}>
			<ChatControl
				chatSocket={chatSocket}
				selectChannelIndex={selectChannelIndex}
				chatStatus={chatStatus}
				setChatStatus={setChatStatus}
			/>
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
	);
};

export default ChatBox;

