import axios from "axios";
import { useEffect, useState } from "react";
import socketIOClient from "socket.io-client";
import { MessageDto, UserChannelsDto } from "./class/user-channels.dto";
import './Chat.scss';
import ChatArea from "./ChatArea";


const Chat = () => {
	const [userChannels, setUserChannels] = useState<UserChannelsDto[]>([]);
	const [selectedChannel, setSelectedChannel] = useState<number>(0);
	const [msgInput, setMsgInput] = useState<string>("");
	const [socket, setSocket] = useState<any>(null);

	useEffect(() => {

		const connectSocket = (userChannels: UserChannelsDto[]) => {
			const new_socket = socketIOClient("http://localhost:3000/chat", { withCredentials: true });
			setSocket(new_socket);
			new_socket.on("receiveMessage", (data: MessageDto & {channelId: number}) => {
				console.log(data);
				setUserChannels(userChannels.map((channel: UserChannelsDto) => {
					if (channel.id === data.channelId) {
						channel.messages.push(data);
					}
					return channel;
				}));
			});

			for (const channel of userChannels) {
				new_socket.emit("joinChannel", { channelId: channel.id });
			}
		}

		const fetchData = async () => {
			const result: UserChannelsDto[] = (await axios("http://localhost:3000/user/channels/list", { withCredentials: true })).data;
			setUserChannels(result);
			if (result.length > 0) {
				setSelectedChannel(result[0].id);
			}
			connectSocket(result);
		}

		fetchData();
	}, []);
	
	const sendMessage = async () => {
		if (msgInput.length > 0)
		{
			socket.emit("sendMessage", { channelId: selectedChannel, text: msgInput });
		}
		setMsgInput("");
	}
	return (
		<div className="chat">
			<div className="button-area">
				{
					userChannels.map((channel: UserChannelsDto) => {
						var className: string = '';
						if (channel.id === selectedChannel)
							className = 'selected-button';
						return (<button className={className} key={channel.id} onClick={() => setSelectedChannel(channel.id)}>{channel.name}</button>);
					})
				}
			</div>
			<div className="chat-area">
				<ChatArea messages={userChannels.find(x => x.id === selectedChannel)?.messages} />
			</div>
			<div className="input-area">
				<input type="text" placeholder="Type your message here" value={msgInput} onChange={(e) => setMsgInput(e.target.value)} />
				<button onClick={sendMessage}>Send</button>
			</div>
		</div>
	)
}

export default Chat;
