import { useContext, useEffect, useState } from "react";
import { ChannelDto } from "./types/user-channels.dto";
import './OldChat.scss';
import { RequestWrapper } from "../../utils/RequestWrapper";
import { ChatSocket } from "./utils/ChatSocket";
import MessageArea from "./MessageArea";
import InputChat from "./InputChat";
import SelectChannel from "./SelectChannel";
import { FetchStatusData } from "../../types/FetchStatusData";
import LoginContext from "../../contexts/LoginContext";
import NotificationContext, { NotificationNH } from "../../contexts/NotificationContext";

export type ChatSocketState = {
	chatSocket: ChatSocket | undefined;
	setChatSocket: (chatSocket: ChatSocket) => void;
}

const Chat = () => {
	const [channelsFetched, setChannelsFetched] = useState(false);
	const [chatSocket, setChatSocket] = useState<ChatSocket>();
	const [selectChannelIndex, setSelectChannelIndex] = useState<number>(0);
	const notificationHandler = useContext(NotificationContext);

	const fetchStatusValue: {
		fetchStatus: FetchStatusData,
		setFetchStatus: (fetchStatus: FetchStatusData) => void
	} = useContext(LoginContext);



	useEffect(() => {
		const fetchChannels = async () => {
			const channels = await RequestWrapper.get<ChannelDto[]>('/user/channels/list');
			channels && setChatSocket(new ChatSocket(channels, { setChatSocket }, fetchStatusValue.fetchStatus.user));
		}
		if (!channelsFetched) {
			fetchChannels();
			setChannelsFetched(true);
		}
	}, [channelsFetched, fetchStatusValue.fetchStatus.user]);

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
