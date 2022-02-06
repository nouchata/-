import { useContext, useEffect } from "react";
import HideDisplayContext from "../../contexts/HideDisplayContext";
import { HideDisplayData } from "../../types/HideDisplayData";
import "./styles/game.scss";

const Game = () : JSX.Element => {
	const [, setHideDisplay] = useContext(HideDisplayContext) as [HideDisplayData, Function];

	useEffect(() => {
		setHideDisplay({ hideSidebar: true, hideButtons: true, hideMainContainerStyle: true } as HideDisplayData);

		return function cleanup() {
			setHideDisplay({});
		};
	}, []);

	return (
		<div className="game-container">
			x
		</div>
	);
};

export default Game;