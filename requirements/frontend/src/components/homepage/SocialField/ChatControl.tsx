import { faMinimize, faMaximize, faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ChatOption from "../../chat/Options/ChatOption";
import { ChatSocket } from "../../chat/utils/ChatSocket";
import { ChatState } from "./HSocialField";

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

export default ChatControl;