import { useEffect, useState } from "react";
import { ChannelDto } from "./types/user-channels.dto";
import './Chat.scss';
import { RequestWrapper } from "../../utils/RequestWrapper";
import { ChatSocket } from "./utils/ChatSocket";
import MessageArea from "./MessageArea";
import InputChat from "./InputChat";
import SelectChannel from "./SelectChannel";

export type ChatSocketState = {
	chatSocket: ChatSocket | undefined;
	setChatSocket: (chatSocket: ChatSocket) => void;
}

const Chat = () => {
	const [channelsFetched, setChannelsFetched] = useState(false);
	const [chatSocket, setChatSocket] = useState<ChatSocket>();
	const [selectChannelIndex, setSelectChannelIndex] = useState<number>(0);


	useEffect(() => {
		const fetchChannels = async () => {
			const result = await RequestWrapper.get<ChannelDto[]>('/user/channels/list');
			result && setChatSocket(new ChatSocket(result, { setChatSocket }));
		}
		if (!channelsFetched) {
			fetchChannels();
			setChannelsFetched(true);
		}
	}, [channelsFetched]);

	return (
		<div className="chat">
			<SelectChannel channels={chatSocket?.channels} selectChannelIndex={selectChannelIndex} setSelectChannelIndex={setSelectChannelIndex} />
			<div className="chat-container">
				<div className="chat-box">
					<h1 className="channel-title">{chatSocket ? chatSocket.channels[selectChannelIndex]?.name : 'Loading...'}</h1>
					<MessageArea index={selectChannelIndex} chatSocket={chatSocket} />
					<InputChat
						selectChannelIndex={selectChannelIndex}
						sendMessage={(text, channelIndex) => chatSocket?.sendMessage(text, channelIndex)} />
				</div>
			</div>
		</div>
	)
}

export default Chat;
