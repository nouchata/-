import { useState } from "react";

const InputChat = ({
		selectChannelIndex,
		sendMessage
	} : {
		selectChannelIndex: number;
		sendMessage: (text: string, channelIndex: number) => void;
	}
) => {
	const [msgInput, setMsgInput] = useState<string>("");
	return (
		<div className="input-area">
			<input className="input-field" type="text" placeholder="Type your message here" value={msgInput} onChange={(e) => setMsgInput(e.target.value)} />
			<button className="input-button"
			onClick={
				() => {
					sendMessage(msgInput, selectChannelIndex);
					setMsgInput('');
				}
			}
			>Send</button>
		</div>
	)
};

export default InputChat;
