import { useEffect, useRef } from "react";
import "./styles/game.scss";
import { GameClientInstance } from "./game/GameClientInstance";
import { useQuery } from "../../utils/useQuery";
import { useDisplay } from "../../Providers/DisplayProvider";
import { useLogin } from "../../Providers/LoginProvider";

const Game = () : JSX.Element => {
	const { setDisplayData } = useDisplay();
	const { loginStatus } = useLogin();
	const queryCode = useQuery().get('play');
	const querySpectator = useQuery().get('forceSpectator');
	const gci = useRef<GameClientInstance>();

	useEffect(() => {
		setDisplayData({ hideSidebar: true, hideButtons: true, hideMainContainerStyle: true });
		gci.current = new GameClientInstance(loginStatus.user?.id as number, Number(queryCode), querySpectator ? true : false);
		
		return function cleanup() {
			if (gci.current) {
				gci.current.destroy();
				gci.current = undefined;
			}
			setDisplayData({});
		};
	}, []); // eslint-disable-line

	return (
		<div className="game-container">
			<div className="game-display"><canvas id="game-canvas" /></div>
			{/* <div className="game-extras"></div> */}
		</div>
	);
};

export default Game;