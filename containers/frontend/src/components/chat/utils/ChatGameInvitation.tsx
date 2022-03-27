import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faEllipsis,
	faTableTennisPaddleBall,
	faWifi,
	faPowerOff,
	faPlay,
	faArrowsRotate,
	faCircleNotch
} from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from "react";
import { ResponseState, RUNSTATE } from "../../game/game/types/ResponseState";
import { useNavigate } from "react-router-dom";
import { RequestWrapper } from "../../../utils/RequestWrapper";

import "../../../styles/chat_game_invitation.scss";

const cgiFigureContent = [
	{ icon: faEllipsis, message: "Waiting for players to connect..." },
	{ icon: faTableTennisPaddleBall, message: "Game on." },
	{ icon: faWifi, message: "Waiting for players to reconnect..." },
	{ icon: faPowerOff, message: "Game ended" },
	{ icon: faPowerOff, message: "Invalid Invitation" },
	{ icon: faPowerOff, message: "Network Error" }
];

const ChatGameInvitation = (props: { instanceId: string }) : JSX.Element => {
	// const [ secondLine, setSecondLine ] = useState<string>('00:00');
	const [ instanceData, setInstanceData ] = useState<RUNSTATE | undefined>();
	const navigate = useNavigate();

	useEffect(() => {
		fetchInstanceData();
	}, []); // eslint-disable-line

	const fetchInstanceData = async() => {
		setInstanceData(undefined);
		const responseData = await RequestWrapper.get<ResponseState>(`/game/state/${props.instanceId}`, undefined);
		if (responseData)
			setInstanceData(responseData.runState);
		else
			setInstanceData(RUNSTATE.ENDED);
	};

	return (
		<figure className="chat-game-invitation">
			{instanceData === undefined && <FontAwesomeIcon icon={faCircleNotch} spin={true} className="chat-game-invitation-loader" />}
			{(instanceData !== undefined && instanceData >= 4) && <figcaption className="chat-game-invitation-current-state error">{cgiFigureContent[instanceData].message}</figcaption>}
			{(instanceData !== undefined && instanceData < 4) &&
				<>
					<div className="chat-game-invitation-figure">
						<FontAwesomeIcon icon={cgiFigureContent[instanceData].icon} />
					</div>
					<figcaption className="chat-game-invitation-current-state">
						<h1>You've been invited!</h1>
						<span className="cgi-cs-line first">{cgiFigureContent[instanceData].message}</span>
						{/* <span className="cgi-cs-line">{secondLine}</span> */}
					</figcaption>
					<div className="chat-game-invitation-buttons">
						<button onClick={(e) => fetchInstanceData()}><FontAwesomeIcon icon={faArrowsRotate} /></button>
						<button onClick={(e) => navigate(`/game?play=${props.instanceId}`)}><FontAwesomeIcon icon={faPlay} /></button>
					</div>
				</>
			}
		</figure>
	);
};

export default ChatGameInvitation;