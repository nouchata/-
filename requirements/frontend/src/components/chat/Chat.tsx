import axios from "axios";
import { useEffect, useState } from "react";
import socketIOClient from "socket.io-client";
import { MessageDto, UserChannelsDto } from "./class/user-channels.dto";
import './Chat.scss';
import ChatArea from "./ChatArea";


const Chat = () => {
	const [userChannels, setUserChannels] = useState<UserChannelsDto[]>([]);
	// save selected channel by index
	const [selectedChannel, setSelectedChannel] = useState<number>(0);
	const [msgInput, setMsgInput] = useState<string>("");
	const [socket, setSocket] = useState<any>(null);

	useEffect(() => {
		const connectSocket = (userChannels: UserChannelsDto[]) => {
			const new_socket = socketIOClient("http://localhost:3000/chat", { withCredentials: true });
			setSocket(new_socket);
			new_socket.on("receiveMessage", (data: MessageDto & { channelId: number }) => {
				setUserChannels(userChannels.map(channel => {
					if (channel.id === data.channelId) {
						channel.messages.push(data);
					}
					return channel;
				}
				));
			});

			for (const channel of userChannels) {
				new_socket.emit("joinChannel", { channelId: channel.id });
			}
		}

		const fetchData = async () => {
			const result: UserChannelsDto[] = (await axios("http://localhost:3000/user/channels/list", { withCredentials: true })).data;
			setUserChannels(result);
			connectSocket(result);
		}

		fetchData();
	}, []);

	const sendMessage = async () => {
		if (msgInput.length > 0) {
			socket.emit("sendMessage", { channelId: userChannels[selectedChannel].id, text: msgInput });
		}
		setMsgInput("");
	}
	return (
		<div>
			<div className="button-area">
				{
					userChannels.map((channel: UserChannelsDto, index: number) => {
						var className: string = '';
						if (index === selectedChannel)
							className = 'selected-button';
						return (<button className={className} key={index} onClick={() => setSelectedChannel(index)}>{channel.name}</button>);
					})
				}
			</div>
			<div className="chat">
				<h1 className="channel-title">{userChannels[selectedChannel]?.name}</h1>
				<div className="message-area">
					<ChatArea channel={userChannels[selectedChannel]} />
				</div>
				<div className="input-area">
						<input className="input-field" type="text" placeholder="Type your message here" value={msgInput} onChange={(e) => setMsgInput(e.target.value)} />
						<button className="input-button" onClick={sendMessage}>Send</button>
					</div>
			</div>
		</div>
	)
}

export default Chat;
