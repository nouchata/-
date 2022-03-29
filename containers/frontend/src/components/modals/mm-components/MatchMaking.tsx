import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faCheck,
	faCircleNotch,
	faUserSecret,
	faUserNinja,
	faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons';
import { useEffect, useRef, useState } from "react";

import "./styles/matchmaking.scss"; 
import { RequestWrapper } from "../../../utils/RequestWrapper";
import { useNavigate } from "react-router-dom";
import { useModal } from "../../../Providers/ModalProvider";

const matchMakingValues : { [id: number]: { icon: JSX.Element, label: string } } = {
	0: { icon: <FontAwesomeIcon icon={faUserSecret} />, label: 'Launch' },
	1: { icon: <FontAwesomeIcon icon={faCircleNotch} spin />, label: 'Searching...' },
	2: { icon: <FontAwesomeIcon icon={faUserNinja} />, label: 'User found' },
	3: { icon: <FontAwesomeIcon icon={faCheck} />, label: 'Click to play' },
	4: { icon: <FontAwesomeIcon icon={faExclamationTriangle} />, label: 'Error' }
};

const MatchMaking = () : JSX.Element => {
	const [ fetchState, setFetchState ] = useState<number>(0);
	const [ additionalText, setAdditionalText ] = useState<string>('');
	const refValues = useRef<{ isFetching: boolean, instanceId: number }>({ isFetching: false, instanceId: 0 });
	const navigate = useNavigate();
	const { setModalProps } = useModal();

	async function handleError(error: string) {
		refValues.current.isFetching = false;
		setFetchState(4);
		setAdditionalText(error);
		await new Promise((resolve) => setTimeout(() => resolve(1), 2000));
		setFetchState(0);
		setAdditionalText('');
	}

	async function handleFound(message?: string) {
		refValues.current.isFetching = false;
		setFetchState(2);
		setAdditionalText(message || '');
		await new Promise((resolve) => setTimeout(() => resolve(1), 500));
		setFetchState(3);
	}

	async function handleClick() {
		if (fetchState === 0 && !refValues.current.isFetching) {
			refValues.current.isFetching = true;

			let registerError : boolean = false;
			const joinResponse : number | undefined = await RequestWrapper.post(
				'/game/join',
				undefined,
				(e) => {
					registerError = true;
					handleError(e.message);
				}
			);
			if (registerError)
				return ;
			if (joinResponse && joinResponse !== 0) {
				refValues.current.instanceId = joinResponse;
				return handleFound("You're already in a game, click to join it.");
			}
			
			setFetchState(1);
			setAdditionalText('You\'re currently in queue. To quit the search, close this modal.');
			while (refValues.current.isFetching) {
				const instanceId : number | undefined = await RequestWrapper.get<number>(
					'/game/match',
					undefined,
					(e) => handleError(e.message)
				);
				if (instanceId) {
					refValues.current.instanceId = instanceId;
					handleFound();
				}
				await new Promise((resolve) => setTimeout(() => resolve(1), 500));
			}
		} else if (fetchState === 3 && refValues.current.instanceId) {
			navigate(`/game?play=${refValues.current.instanceId}`);
			setModalProps({ show: false, content: <div /> });
		}
	}

	useEffect(() => {
		return (function cleanup() {
			RequestWrapper.post('/game/leave');
			if (refValues.current.isFetching)
				refValues.current.isFetching = false; // eslint-disable-line
		});
	}, [refValues]);

	return (
		<div className="mm-container">
			<button disabled={fetchState === 4} onClick={(e) => handleClick()}>
				{matchMakingValues[fetchState].icon}
				<span>{matchMakingValues[fetchState].label}</span>
			</button>
			{additionalText && <p className="mm-additional-text">{additionalText}</p>}
		</div>
	);
};

export default MatchMaking;