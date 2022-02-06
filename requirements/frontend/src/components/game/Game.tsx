import { useContext, useEffect } from "react";
import HideDisplayContext from "../../contexts/HideDisplayContext";
import { HideDisplayData } from "../../types/HideDisplayData";
import "./styles/game.scss";
import { exec } from "./game/game";

const Game = () : JSX.Element => {
	const [, setHideDisplay] = useContext(HideDisplayContext) as [HideDisplayData, Function];

	useEffect(() => {
		setHideDisplay({ hideSidebar: true, hideButtons: true, hideMainContainerStyle: true } as HideDisplayData);
		setTimeout(() => exec(), 0);

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