import { useEffect, useState } from "react";
import socketIOClient from "socket.io-client";
import { MessageDto, ChannelDto } from "./types/user-channels.dto";
import './Chat.scss';
import ChatArea from "./ChatArea";
import CreateChannel from "./CreateChannel";
import JoinChannel from "./JoinChannel";
import { RequestWrapper } from "../../utils/RequestWrapper";

const Chat = () => {
	const [userChannels, setUserChannels] = useState<ChannelDto[]>([]);
	// save selected channel by index
	const [selectedChannel, setSelectedChannel] = useState<number>(0);
	const [msgInput, setMsgInput] = useState<string>("");
	const [socket, setSocket] = useState<any>(null);

	useEffect(() => {
		const connectSocket = (userChannels: ChannelDto[]) => {
			const new_socket = socketIOClient(process.env.REACT_APP_BACKEND_ADDRESS + '/chat', { withCredentials: true });
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
			const result = await RequestWrapper.get<ChannelDto[]>('/user/channels/list');

			if (result) {
				setUserChannels(result);
				connectSocket(result);
			}
		}
		fetchData();
	}, []);

	const addUserChannel = async (channel: ChannelDto) => {
		socket.emit("joinChannel", { channelId: channel.id });
		setUserChannels([...userChannels, channel]);
	}

	const sendMessage = async () => {
		if (msgInput.length > 0) {
			socket.emit("sendMessage", { channelId: userChannels[selectedChannel].id, text: msgInput });
		}
		setMsgInput("");
	}

	return (
		<div>
			<CreateChannel userChannels={userChannels} addUserChannel={addUserChannel} />
			<JoinChannel userChannels={userChannels} addUserChannel={addUserChannel} />
			<div className="button-area">
				<h4>channels joined</h4>
				{
					userChannels.map((channel: ChannelDto, index: number) => {

						return (<button
							className={index === selectedChannel ? 'selected-button' : ''}
							key={index} onClick={() => setSelectedChannel(index)}>
							{channel.name}
						</button>);
					})
				}
			</div>
			<div className="chat">
				<h1 className="channel-title">{userChannels[selectedChannel]?.name}</h1>
				<ChatArea channel={userChannels[selectedChannel]} />
				<div className="input-area">
					<input className="input-field" type="text" placeholder="Type your message here" value={msgInput} onChange={(e) => setMsgInput(e.target.value)} />
					<button className="input-button" onClick={sendMessage}>Send</button>
				</div>
			</div>
		</div>
	)
}

export default Chat;
