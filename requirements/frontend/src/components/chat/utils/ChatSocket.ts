import { ChannelDto, MessageDto, User } from "../types/user-channels.dto";
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
	private _user?: User;

	/*
	** this is where we deep copy the Class
	*/
	private _updateChatSocket() {

		// copy this with all methods
		const chatSocket = new ChatSocket(this.channels, this._callbacks, this._user, this._socket);

		// it will not work if we just doo:
		// this._callbacks.setChatSocket(this)
		this._callbacks.setChatSocket(chatSocket);
		// destroy old socket
	}

	constructor(channels: ChannelDto[], callbacks: CallBacks, user?: User, socket?: Socket) {

		this._channels = channels;
		this._callbacks = callbacks;
		this._user = user;

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
				this._socket.emit("connectChannel", { channelId: channel.id })
			}

			// we register the event
			this._socket.on("receiveMessage", (msg: MessageDto & { channelId: number }) => {
				// add message to channel matching channelId
				this._channels.find(channel => channel.id === msg.channelId)?.messages.push(msg);
				// we update the state
				this._updateChatSocket();
				// we call the callback if it exists
				this._callbacks.onMessage && this._callbacks.onMessage(msg);
			});

			this._socket.on('newUser', (user: User & { channelId: number }) => {
				this._channels.find(channel => channel.id === user.channelId)?.users.push(user);
				this._updateChatSocket();
			});

			this._socket.on('removeUser', (user: User & { channelId: number }) => {
				console.log(user);
				// remove user from channel
				// check if removed user is the current user
				if (this._user && this._user.id === user.id) {
					// if it is, we need to remove the channel
					this._channels = this._channels.filter(channel => channel.id !== user.channelId);
				}
				else {
					// else we remove the user from the channel
					let channel = this._channels.find(channel => channel.id === user.channelId);
					if (channel) {
						channel.users = channel.users.filter(u => u.id !== user.id);
						this._channels = this._channels.map(channel => channel.id === user.channelId ? channel : channel);
					}

				}
				this._updateChatSocket();
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
