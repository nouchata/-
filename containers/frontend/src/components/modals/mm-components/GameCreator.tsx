import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLogin } from "../../../Providers/LoginProvider";
import { useModal } from "../../../Providers/ModalProvider";
import { User } from "../../../types/User";
import { RequestWrapper } from "../../../utils/RequestWrapper";

import "./styles/gamecreator.scss";

function submitTextValue(instanceId: number) : string {
	switch (instanceId) {
		case (0):
			return ("Submit");
		case (-1):
			return ("Error, please try again.");
		default:
			return ("The game has been created, you'll be redirected soon.");
	}
}

const GameCreator = () : JSX.Element => {
	const [ currentlyFetching, setCurrentlyFetching ] = useState<boolean>(false);
	const [ userTwoFound, setUserTwoFound ] = useState<number>(0);
	const [ userTwoLogin, setUserTwoLogin ] = useState<string>('');
	const [ timeoutStamp, setTimeoutStamp ] = useState<number>(0);
	const [ instanceId, setInstanceId ] = useState<number>(0);
	const [ gameType, setGameType ] = useState<"standard" | "extended">("standard");
	const { loginStatus } = useLogin();
	const navigate = useNavigate();
	const { setModalProps } = useModal();

	async function fetchUserTwo() {
		let errorHappened : boolean = false;
		setCurrentlyFetching(true);
		const fetchedUser : User[] | undefined = await RequestWrapper.post<User[]>(
			"/user/search/login",
			{ loginfragment: userTwoLogin, maxresults: 1, offset: 1 },
			() => errorHappened = true
		);
		if (errorHappened) {
			setUserTwoFound(-1);
			await new Promise((resolve) => setTimeout(() => resolve(1), 1000));
			setUserTwoLogin("");
			setUserTwoFound(0);
		} else if (fetchedUser) {
			setUserTwoLogin(fetchedUser[0].displayName);
			setUserTwoFound(fetchedUser[0].id);
		}
		setTimeoutStamp(0);
		setCurrentlyFetching(false);
	}

	async function fetchGameCreator(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		e.stopPropagation();
		if (!currentlyFetching && userTwoFound > 0 && !instanceId) {
			setCurrentlyFetching(true);
			let fetchInstanceId : number | undefined = await RequestWrapper.post<number>(
				"/game/create",
				{ ids: [loginStatus.user?.id || 0, userTwoFound], options: { gameType } }
			);
			if (fetchInstanceId && fetchInstanceId > 0) {
				setInstanceId(fetchInstanceId);
				/* TODO: spot to warn the other player about the game */
				await new Promise((resolve) => setTimeout(() => resolve(1), 1000));
				setModalProps({ show: false, content: <div /> });
				navigate(`/game?play=${String(fetchInstanceId)}`);
			} else {
				setInstanceId(-1);
				await new Promise((resolve) => setTimeout(() => resolve(1), 1000));
				setInstanceId(0);
			}
			setCurrentlyFetching(false);
		}
	}

	useEffect(() => {
		return (function cleanup() {
			if (timeoutStamp)
				clearTimeout(timeoutStamp);
		});
	}, [timeoutStamp]);

	return (
		<div className="gc-container">
			<form className="gc-fields" id="gc-fields" onSubmit={(e) => fetchGameCreator(e)}>
				<div className="gc-players">
					<div className="gc-player">
						<label>Player 1:</label>
						<input type="text" name="Player 1" value={loginStatus.user?.displayName} disabled={true} />
					</div>
					<div className="gc-player">
						<label>Player 2:</label>
						<input type="text" name="Player 2" placeholder="Login of your opponent" value={userTwoLogin} disabled={currentlyFetching || userTwoFound !== 0} onChange={(e) => {
							if (!currentlyFetching && !userTwoFound) {
								if (timeoutStamp) {
									clearTimeout(timeoutStamp)
								}
								setTimeoutStamp(setTimeout(() => fetchUserTwo(), 1000) as unknown as number);
								setUserTwoLogin(e.target.value);
							}
						}}>
						</input>
						{userTwoFound === -1 && <span className="gc-player-error">The login was no one's.</span>}
						{userTwoFound > 0 && <span className="gc-player-done" onClick={(e) => {
							setUserTwoLogin("");
							setUserTwoFound(0);
							setTimeoutStamp(0);
						}}>Click here to reset the second player.</span>}
					</div>
				</div>
				<div className="gc-other">
					<label>Game type:</label>
					<select name="game-type" value={gameType} onChange={(e) => setGameType(e.target.value as "standard" | "extended")}>
						<option value="standard">Standard</option>
						<option value="extended">Extended</option>
					</select>
				</div>
			</form>
			<input className="gc-button" form="gc-fields" type="submit" disabled={userTwoFound <= 0 || instanceId !== 0} value={submitTextValue(instanceId)} />
		</div>
	);
};

export default GameCreator;