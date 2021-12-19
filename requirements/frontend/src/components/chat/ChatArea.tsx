import { MessageDto, User, UserChannelsDto } from "./class/user-channels.dto";

const ChatArea = ({ channel }: { channel: UserChannelsDto | undefined }) => {

	if (!channel)
		return <div>No channel selected</div>;
	// transform channel.user to use user.id as key as users[id]
	const users = channel.users.reduce((acc, user) => {
		acc[user.id] = user;
		return acc;
	}, {} as { [id: number]: User });

	// access to users by id


	return (<div>
		{
			channel?.messages.map((message: MessageDto) => {
				return (<div className='message-chat' key={message.id}>
					<div className='bubble'>
						{message.text}
					</div>
				</div>);
			})
		}
	</div>);
}

export default ChatArea;
