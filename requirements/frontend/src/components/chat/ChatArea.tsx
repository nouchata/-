import { MessageDto } from "./class/user-channels.dto";

const ChatArea = ({messages}: {messages: MessageDto[] | undefined}) => {
	return (<div>
		{
			messages?.map((message: MessageDto) => {
				return (<div key={message.id}>
					{message.userId} {message.text}
				</div>);
			})
		}
	</div>);
}

export default ChatArea;
