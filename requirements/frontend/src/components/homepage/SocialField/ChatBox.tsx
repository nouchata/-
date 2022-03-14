import { faClose, faMaximize, faMinimize } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import InputChat from '../../chat/InputChat';
import MessageArea from '../../chat/MessageArea';
import ChatOption from '../../chat/Options/ChatOption';
import { ChatSocket } from '../../chat/utils/ChatSocket';
import { ChatState } from './HSocialField';



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
					<FontAwesomeIcon icon={faMinimize} className="icon-options" />
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
					<FontAwesomeIcon icon={faMaximize} className="icon-options" />
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
				<FontAwesomeIcon icon={faClose} className="icon-options" />
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

