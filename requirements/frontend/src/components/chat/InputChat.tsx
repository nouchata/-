import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faMessage
} from '@fortawesome/free-solid-svg-icons';
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
			<input
			className="input-field"
			type="text"
			placeholder="Type your message here"
			value={msgInput}
			onChange={(e) => setMsgInput(e.target.value)}
			onKeyPress={(e) => {
				if (e.key === 'Enter') {
					sendMessage(msgInput, selectChannelIndex);
					setMsgInput("");
				}
			}}
			/>
			<button
			className="input-button"
			disabled={!msgInput.length}
			onClick={
				() => {
					sendMessage(msgInput, selectChannelIndex);
					setMsgInput('');
				}
			}
			><FontAwesomeIcon icon={faMessage} /></button>
		</div>
	)
};

export default InputChat;
