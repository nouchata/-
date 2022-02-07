import { useContext, useEffect } from "react";
import HideDisplayContext from "../../contexts/HideDisplayContext";
import { HideDisplayData } from "../../types/HideDisplayData";
import "./styles/game.scss";
import { exec } from "./game/game";
import { useQuery } from "../../utils/useQuery";
import { GameWS } from "./game/GameWS";

const Game = () : JSX.Element => {
	const [, setHideDisplay] = useContext(HideDisplayContext) as [HideDisplayData, Function];
	const queryCode = useQuery().get('play');
	let wsClient : GameWS;

	useEffect(() => {
		setHideDisplay({ hideSidebar: true, hideButtons: true, hideMainContainerStyle: true } as HideDisplayData);
		setTimeout(() => exec(), 0);
		wsClient = new GameWS(Number(queryCode), () => {});

		return function cleanup() {
			setHideDisplay({});
		};
	}, []);

	return (
		<div className="game-container">
			<div className="game-display"><canvas id="game-canvas" /></div>
			<div className="game-extras"></div>
		</div>
	);
};

export default Game;