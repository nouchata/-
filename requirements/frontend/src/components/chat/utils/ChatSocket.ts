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

	/*
	** this is where we deep copy the Class
	*/
	private _updateChatSocket() {

		// copy this with all methods
		const chatSocket = new ChatSocket(this.channels, this._callbacks, this._socket);

		// it will not work if we just doo:
		// this._callbacks.setChatSocket(this)
		this._callbacks.setChatSocket(chatSocket);
		// destroy old socket
	}

	constructor(channels: ChannelDto[], callbacks: CallBacks, socket?: Socket) {

		this._channels = channels;
		this._callbacks = callbacks;
		
		// if we have socket, we can use it
		if (socket)
			this._socket = socket;
		else {
			// if we don't have socket, we create a new one 
			this._socket = socketIOClient(
				process.env.REACT_APP_BACKEND_ADDRESS + '/chat',
				{ withCredentials: true });

			// we join all channels
			for (const channel of channels) {
				this._socket.emit("joinChannel", { channelId: channel.id })
			}

			// we register the event
			this._socket.on("receiveMessage", async (msg: MessageDto & { channelId: number }) => {
				// add message to channel matching channelId
				this._channels.find(channel => channel.id === msg.channelId)?.messages.push(msg);
				// we update the state
				this._updateChatSocket();
				// we call the callback if it exists
				this._callbacks.onMessage && this._callbacks.onMessage(msg);
			});
		}

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
