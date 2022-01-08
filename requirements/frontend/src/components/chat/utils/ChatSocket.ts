import { ChannelDto, MessageDto } from "../types/user-channels.dto";
import socketIOClient, { Socket } from "socket.io-client";


type CallBacks = {
	setChatSocket: (socket: ChatSocket) => void;
	onMessage?: (message: MessageDto & { channelId: number }) => void;
}


 /*
 ** this class is responsible for connecting to the server and handling the socket
 ** every time we want to update the state we need to do a deep copy because
 ** react is not aware of the changes made inside the class
 */
export class ChatSocket {
	private _socket: Socket;
	private _channels: ChannelDto[];
	private _callbacks: CallBacks;

	private _updateChatSocket() {
		// copy this with all methods
		const chatSocket = new ChatSocket(this.channels, this._callbacks, this._socket);

		this._callbacks.setChatSocket(chatSocket);
		// destroy old socket
	}

	constructor(channels: ChannelDto[], callbacks: CallBacks, socket?: Socket) {

		// if we have socket, we can use it
		if (socket)
			this._socket = socket;
		else {
			this._socket = socketIOClient(
				process.env.REACT_APP_BACKEND_ADDRESS + '/chat',
				{ withCredentials: true });


			for (const channel of channels) {
				this._socket.emit("joinChannel", { channelId: channel.id })
			}
			this._socket.on("receiveMessage", async (msg: MessageDto & { channelId: number }) => {
				this._callbacks.onMessage && this._callbacks.onMessage(msg);
				// add message to channel matching channelId
				this._channels.find(channel => channel.id === msg.channelId)?.messages.push(msg);
				console.log(this._channels);
				this._updateChatSocket();
			});
		}
		this._channels = channels;
		this._callbacks = callbacks;
	}


	// public methods
	public sendMessage(text: string, channelIndex: number) {
		this._socket.emit("sendMessage", { text, channelId: this.channels[channelIndex].id });
	}

	// getters
	public get channels() {
		return this._channels;
	}
	// setters

}
