import { useContext, useEffect } from "react";
import HideDisplayContext from "../../contexts/HideDisplayContext";
import { HideDisplayData } from "../../types/HideDisplayData";
import "./styles/game.scss";
import { GameClientInstance } from "./game/GameClientInstance";
import { useQuery } from "../../utils/useQuery";
import LoginContext from "../../contexts/LoginContext";
import { FetchStatusData } from "../../types/FetchStatusData";

const Game = () : JSX.Element => {
	const [, setHideDisplay] = useContext(HideDisplayContext) as [HideDisplayData, Function];
	const { fetchStatus } = useContext(LoginContext) as {
		fetchStatus: FetchStatusData | undefined;
		setFetchStatus: React.Dispatch<React.SetStateAction<FetchStatusData | undefined>>;
	};
	const queryCode = useQuery().get('play');
	const querySpectator = useQuery().get('forceSpectator');
	let gci : GameClientInstance;

	useEffect(() => {
		setHideDisplay({ hideSidebar: true, hideButtons: true, hideMainContainerStyle: true } as HideDisplayData);
		// eslint-disable-next-line
		setTimeout(() => gci = new GameClientInstance(fetchStatus?.user?.id as number, Number(queryCode), querySpectator ? true : false), 10);
		

		return function cleanup() {
			gci.destroy();
			setHideDisplay({});
		};
	}, []);

	return (
		<div className="game-container">
			<div className="game-display"><canvas id="game-canvas" /></div>
			{/* <div className="game-extras"></div> */}
		</div>
	);
};

export default Game;