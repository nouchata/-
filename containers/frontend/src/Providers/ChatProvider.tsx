import {
	createContext,
	ReactNode,
	useContext,
	useEffect,
	useState,
} from 'react';
import socketIOClient, { Socket } from 'socket.io-client';
import { UpdateChannelDto } from '../components/chat/types/update-channel.dto';
import {
	MessageDto,
	ChannelDto,
} from '../components/chat/types/user-channels.dto';
import { User } from '../types/User';
import { RequestWrapper } from '../utils/RequestWrapper';
import { useLogin } from './LoginProvider';

type CallBacks = {
	setChatSocket: (socket: ChatSocket) => void;
	onMessage?: (message: MessageDto, channel: ChannelDto) => void;
};

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
		const chatSocket = new ChatSocket(
			this.channels,
			this._callbacks,
			this._user,
			this._socket
		);

		// it will not work if we just doo:
		// this._callbacks.setChatSocket(this)
		this._callbacks.setChatSocket(chatSocket);
		// destroy old socket
	}

	constructor(
		channels: ChannelDto[],
		callbacks: CallBacks,
		user?: User,
		socket?: Socket
	) {
		this._channels = channels;
		this._callbacks = callbacks;
		this._user = user;

		// if we have socket, we can use it
		if (socket) this._socket = socket;
		else {
			// if we don't have socket, we create a new one
			this._socket = socketIOClient('/chat', {
				path: '/api',
				withCredentials: true,
			});
			console.log(process.env.REACT_APP_BACKEND_ADDRESS + '/chat');

			// we join all channels
			for (const channel of channels) {
				this._socket.emit('connectChannel', { channelId: channel.id });
			}

			// we register the event
			this._socket.on(
				'receiveMessage',
				(msg: MessageDto & { channelId: number }) => {
					// add message to channel matching channelId
					let channel_found = this._channels.find(
						(channel) => channel.id === msg.channelId
					);
					if (channel_found) {
						channel_found.messages.push(msg);
						if (this._callbacks.onMessage)
							this._callbacks.onMessage(msg, channel_found);
						this._updateChatSocket();
					}
				}
			);

			this._socket.on('newUser', (user: User & { channelId: number }) => {
				this._channels
					.find((channel) => channel.id === user.channelId)
					?.users.push(user);
				this._updateChatSocket();
			});

			this._socket.on(
				'removeUser',
				(user: User & { channelId: number }) => {
					// remove user from channel
					// check if removed user is the current user
					if (this._user && this._user.id === user.id) {
						// if it is, we need to remove the channel
						this._channels = this._channels.filter(
							(channel) => channel.id !== user.channelId
						);
					} else {
						// else we remove the user from the channel
						let channel = this._channels.find(
							(channel) => channel.id === user.channelId
						);
						if (channel) {
							channel.users = channel.users.filter(
								(u) => u.id !== user.id
							);
						}
					}
					this._updateChatSocket();
				}
			);

			this._socket.on('newChannel', (channel: ChannelDto) => {
				this._channels.push(channel);
				this._updateChatSocket();
			});

			this._socket.on(
				'updateChannelMetadata',
				(channel: UpdateChannelDto) => {
					let channel_found = this._channels.find(
						(c) => c.id === channel.id
					);
					if (
						channel_found &&
						channel_found.channelType !== 'direct'
					) {
						channel_found.name = channel.name;
						channel_found.admins = channel.admins;
						channel_found.owner = channel.owner;
						channel_found.channelType = channel.channelType;
					}
					this._updateChatSocket();
				}
			);
		}
	}

	// public methods
	public sendMessage(text: string, channelIndex: number) {
		this._socket.emit('sendMessage', {
			text,
			channelId: this.channels[channelIndex].id,
		});
	}

	// getters
	public get channels() {
		return this._channels;
	}

	public addChannel(channel: ChannelDto) {
		this._channels.push(channel);
		this._socket.emit('connectChannel', { channelId: channel.id });
		this._updateChatSocket();
	}

	/*
	 ** update callback function
	 */
	public set onMessage(
		callback: (message: MessageDto, channel: ChannelDto) => void
	) {
		this._callbacks.onMessage = callback;
	}
}

export interface ChatState {
	state: 'OPENED' | 'MINIMIZED' | 'CLOSED';
}

interface IChat {
	chatSocket?: ChatSocket;
	selectedChannelIndex: number;
	setSelectedChannelIndex: (index: number) => void;
	chatStatus: ChatState;
	setChatStatus: (status: ChatState) => void;
}

const ChatContext = createContext<IChat | undefined>(undefined);

const useChat = () => {
	const context = useContext(ChatContext);
	if (!context) {
		throw new Error('useChat must be used within a ChatProvider');
	}
	return context;
};

const ChatProvider = ({ children }: { children: ReactNode }) => {
	const [chatSocket, setChatSocket] = useState<ChatSocket>();
	const [selectedChannelIndex, setSelectedChannelIndex] = useState(0);
	const [chatStatus, setChatStatus] = useState<ChatState>({
		state: 'CLOSED',
	});
	const { loginStatus } = useLogin();

	useEffect(() => {
		const fetchChannels = async () => {
			const channels = await RequestWrapper.get<ChannelDto[]>(
				'/user/channels/list'
			);
			channels &&
				setChatSocket(
					new ChatSocket(
						channels,
						{
							setChatSocket,
						},
						loginStatus.user
					)
				);
		};
		fetchChannels();
	}, [loginStatus.user]);

	return (
		<ChatContext.Provider
			value={{
				chatSocket,
				selectedChannelIndex,
				setSelectedChannelIndex,
				chatStatus,
				setChatStatus,
			}}
		>
			{children}
		</ChatContext.Provider>
	);
};

export { ChatProvider, useChat };
