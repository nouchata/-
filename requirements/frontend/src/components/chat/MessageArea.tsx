import { useContext, useEffect, useRef } from "react";
import LoginContext from "../../contexts/LoginContext";
import { FetchStatusData } from "../../types/FetchStatusData";
import { MessageDto, User } from "./types/user-channels.dto";
import { ChatSocket } from "./utils/ChatSocket";


const MessageArea = ({ index, chatSocket }: { index: number, chatSocket: ChatSocket | undefined }) => {

	let fetchStatusValue: { fetchStatus: FetchStatusData; setFetchStatus: (fetchStatus: FetchStatusData) => void } = useContext(LoginContext);
	const messagesEndRef = useRef<HTMLDivElement>(null)

	const scrollToBottom = () => {
		if (messagesEndRef.current) {
			// fast scrool to bottom
			messagesEndRef.current.scrollIntoView();
		}
	}

	useEffect(scrollToBottom);

	const channel = chatSocket?.channels[index];

	if (!channel)
		return <div>No channel selected</div>;

	// transform channel.user to use user.id as key as users[id]
	const users = channel.users.reduce((acc, user) => {
		acc[user.id] = user;
		return acc;
	}, {} as { [id: number]: User });

	return (
		<div className="message-area">
			{
				channel?.messages.map((message: MessageDto, index: number) => {
					return (<div className='message-chat' key={index}>
						{
							message.messageType === 'system' ?
								<div className='message-system'>
									{message.text}
								</div>
								:
								fetchStatusValue.fetchStatus.user?.id === message.userId ?
									<div className="message-self">
										<div className='bubble-self'>
											{
												index === channel.messages.length - 1 ?
													<p className="message-text" ref={messagesEndRef} >{message.text}</p>
													:
													<p className="message-text" >{message.text}</p>
											}
										</div>
									</div>
									:
									<div className="message">
										<div className='bubble'>
											<h5 className="message-display-name" >{(message.userId && users[message.userId]) ? users[message.userId].displayName : 'unknow'}</h5>
											{
												index === channel.messages.length - 1 ?
													<p className="message-text" ref={messagesEndRef} >{message.text}</p>
													:
													<p className="message-text" >{message.text}</p>
											}
										</div>
									</div>
						}
					</div>);
				})
			}
		</div>
	);
}

export default MessageArea;
