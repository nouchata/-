import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLogin } from '../../../Providers/LoginProvider';
import { useModal } from '../../../Providers/ModalProvider';
import { RequestWrapper } from '../../../utils/RequestWrapper';
import { User } from '../../chat/types/user-channels.dto';
import { GameOptions } from '../../game/game/types/GameOptions';

import './styles/gamecreator.scss';

function submitTextValue(instanceId: number): string {
	switch (instanceId) {
		case 0:
			return 'Submit';
		case -1:
			return 'Error, please try again.';
		default:
			return "The game has been created, you'll be redirected soon.";
	}
}

const GameCreator = ({ user }: { user?: User }): JSX.Element => {
	const [currentlyFetching, setCurrentlyFetching] = useState<boolean>(false);
	const [userTwoFound, setUserTwoFound] = useState<number>(user?.id || 0);
	const [userTwoLogin, setUserTwoLogin] = useState<string | undefined>(user?.displayName);
	const [timeoutStamp, setTimeoutStamp] = useState<number>(0);
	const [instanceId, setInstanceId] = useState<number>(0);
	const [gameOptions, setGameOptions] = useState<GameOptions>({
		gameType: 'standard',
		capChargingPPS: 40,
		yDistPPS: 50,
		racketSize: 6,
		ballSpeedPPS: 50
	});
	const { loginStatus } = useLogin();
	const navigate = useNavigate();
	const { setModalProps } = useModal();

	async function fetchUserTwo() {
		let errorHappened: boolean = false;
		setCurrentlyFetching(true);
		const fetchedUser: User[] | undefined = await RequestWrapper.post<
			User[]
		>(
			'/user/search/displayname',
			{ displaynamefragment: userTwoLogin, maxresults: 1, offset: 1 },
			() => (errorHappened = true)
		);
		if (errorHappened) {
			setUserTwoFound(-1);
			await new Promise((resolve) => setTimeout(() => resolve(1), 1000));
			setUserTwoLogin('');
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
			let fetchInstanceId: number | undefined =
				await RequestWrapper.post<number>('/game/create', {
					ids: [loginStatus.user?.id || 0, userTwoFound],
					options: gameOptions,
				});
			if (fetchInstanceId && fetchInstanceId > 0) {
				setInstanceId(fetchInstanceId);
				await new Promise((resolve) =>
					setTimeout(() => resolve(1), 1000)
				);
				setModalProps({ show: false, content: <div /> });
				navigate(`/game?play=${String(fetchInstanceId)}`);
			} else {
				setInstanceId(-1);
				await new Promise((resolve) =>
					setTimeout(() => resolve(1), 1000)
				);
				setInstanceId(0);
			}
			setCurrentlyFetching(false);
		}
	}

	useEffect(() => {
		return function cleanup() {
			if (timeoutStamp) clearTimeout(timeoutStamp);
		};
	}, [timeoutStamp]);

	return (
		<div className="gc-container">
			<form
				className="gc-fields"
				id="gc-fields"
				onSubmit={(e) => fetchGameCreator(e)}
			>
				<div className="gc-players">
					<div className="gc-player">
						<label>Player 1:</label>
						<input
							type="text"
							name="Player 1"
							value={loginStatus.user?.displayName}
							disabled={true}
						/>
					</div>
					<div className="gc-player">
						<label>Player 2:</label>
						<input
							type="text"
							name="Player 2"
							placeholder="Display name of your opponent"
							value={userTwoLogin}
							disabled={currentlyFetching || userTwoFound !== 0}
							onChange={(e) => {
								if (!currentlyFetching && !userTwoFound) {
									if (timeoutStamp) {
										clearTimeout(timeoutStamp);
									}
									setTimeoutStamp(
										setTimeout(
											() => fetchUserTwo(),
											1000
										) as unknown as number
									);
									setUserTwoLogin(e.target.value);
								}
							}}
						></input>
						{userTwoFound === -1 && (
							<span className="gc-player-error">
								The login was no one's.
							</span>
						)}
						{userTwoFound > 0 && (
							<span
								className="gc-player-done"
								onClick={(e) => {
									setUserTwoLogin('');
									setUserTwoFound(0);
									setTimeoutStamp(0);
								}}
							>
								Click here to reset the second player.
							</span>
						)}
					</div>
				</div>
				<div className="gc-other">
					<label>Game type:</label>
					<select
						name="game-type"
						value={gameOptions.gameType}
						onChange={(e) =>
							setGameOptions({
								...gameOptions,
								gameType: e.target.value as 'standard' | 'extended'
							})
						}
					>
						<option value="standard">Standard</option>
						<option value="extended">Extended</option>
					</select>
				</div>
				<div className="gc-other">
					<label>Capacity charging speed (percentage value per sec):</label>
					<select
						name="game-capacity-charging"
						value={String(gameOptions.capChargingPPS)}
						onChange={(e) =>
							setGameOptions({
								...gameOptions,
								capChargingPPS: Number(e.target.value)
							})
						}
						disabled={gameOptions.gameType === "standard"}
					>
						<option value="30">30</option>
						<option value="40">40</option>
						<option value="50">50</option>
						<option value="60">60</option>
					</select>
				</div>
				<div className="gc-other">
					<label>Racket speed (percentage value per sec):</label>
					<select
						name="game-type"
						value={String(gameOptions.yDistPPS)}
						onChange={(e) =>
							setGameOptions({
								...gameOptions,
								yDistPPS: Number(e.target.value)
							})
						}
					>
						<option value="30">30</option>
						<option value="50">50</option>
						<option value="70">70</option>
						<option value="90">90</option>
					</select>
				</div>
				<div className="gc-other">
					<label>Racket size (percentage value of the total playfield height):</label>
					<select
						name="game-type"
						value={String(gameOptions.racketSize)}
						onChange={(e) =>
							setGameOptions({
								...gameOptions,
								racketSize: Number(e.target.value)
							})
						}
					>
						<option value="3">1/3</option>
						<option value="4">1/4</option>
						<option value="5">1/5</option>
						<option value="6">1/6</option>
						<option value="7">1/7</option>
						<option value="8">1/8</option>
					</select>
				</div>
				<div className="gc-other">
					<label>Ball speed (percentage value per sec):</label>
					<select
						name="game-capacity-charging"
						value={String(gameOptions.ballSpeedPPS)}
						onChange={(e) =>
							setGameOptions({
								...gameOptions,
								ballSpeedPPS: Number(e.target.value)
							})
						}
					>
						<option value="30">30</option>
						<option value="35">35</option>
						<option value="40">40</option>
						<option value="45">45</option>
						<option value="50">50</option>
						<option value="70">70</option>
					</select>
				</div>
			</form>
			<input
				className="gc-button"
				form="gc-fields"
				type="submit"
				disabled={userTwoFound <= 0 || instanceId !== 0}
				value={submitTextValue(instanceId)}
			/>
		</div>
	);
};

export default GameCreator;
