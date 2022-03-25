import { ChatSocket } from '../../../Providers/ChatProvider';
import InputChat from '../../chat/InputChat';
import MessageArea from '../../chat/MessageArea';
import ChatControl from './ChatControl';
import { ChatState } from './HSocialField';

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

