import axios from "axios";
import { useEffect, useState } from "react";
import socketIOClient from "socket.io-client";

const Chat = () => {
	//GET data from http://localhost:3000/user/channels/list

	const [channels, setChannels] = useState<any[]>([]);

	const fetchData = async () => {
		const result = await axios("http://localhost:3000/user/channels/list", { withCredentials: true });
		setChannels(result.data);
		console.log(result.data);
	}

	const connectSocket = (channels: any[]) => {
		const socket = socketIOClient("http://localhost:3000/chat", {withCredentials: true});
		socket.on("connect", () => {
			console.log("connected");
		});
	}

	useEffect(() => {
		fetchData();
		connectSocket(channels);
	}, []);

	return (
		<div className="chat">
			{channels.map(
				(channel) => {
					return (
						<button key={channel.id}>
							{channel.name}
						</button>
					);
				}
			)}
			<div>
				<p>froz: hello</p>
			</div>
		</div>
	);
}

export default Chat;
