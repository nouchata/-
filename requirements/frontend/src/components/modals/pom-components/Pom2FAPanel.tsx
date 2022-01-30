import { useState } from "react";
import { FetchStatusData } from "../../../types/FetchStatusData";
import TFACodeInput, { TCIState } from "../../utils/TFACodeInput";

import "./styles/2fa_panel.scss";

const defaultQrCode : JSX.Element = <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 29 29" shape-rendering="crispEdges"><path stroke="#000000" d="M0 0.5h7m1 0h1m3 0h4m1 0h1m4 0h7M0 1.5h1m5 0h1m3 0h1m1 0h1m2 0h1m1 0h1m4 0h1m5 0h1M0 2.5h1m1 0h3m1 0h1m1 0h1m4 0h1m3 0h1m1 0h2m1 0h1m1 0h3m1 0h1M0 3.5h1m1 0h3m1 0h1m2 0h1m1 0h2m2 0h1m1 0h2m3 0h1m1 0h3m1 0h1M0 4.5h1m1 0h3m1 0h1m2 0h1m1 0h1m3 0h4m1 0h1m1 0h1m1 0h3m1 0h1M0 5.5h1m5 0h1m1 0h1m1 0h1m2 0h2m1 0h1m3 0h1m1 0h1m5 0h1M0 6.5h7m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h7M9 7.5h1m3 0h1m2 0h1m1 0h1m1 0h1M0 8.5h1m1 0h1m3 0h2m1 0h1m1 0h1m1 0h1m1 0h2m2 0h1m3 0h1m2 0h1m1 0h1M4 9.5h2m1 0h2m2 0h1m3 0h3m1 0h2m1 0h2m3 0h2M0 10.5h1m1 0h2m2 0h3m1 0h1m1 0h4m1 0h4m1 0h5m1 0h1M0 11.5h1m3 0h2m3 0h4m1 0h1m1 0h1m1 0h1m1 0h2m1 0h1m1 0h1m1 0h1M0 12.5h4m2 0h2m2 0h1m2 0h4m2 0h1m1 0h3m1 0h1M5 13.5h1m4 0h1m2 0h4m1 0h3m1 0h2m1 0h2m1 0h1M1 14.5h1m1 0h5m2 0h1m4 0h2m1 0h5m2 0h2m1 0h1M1 15.5h2m2 0h1m3 0h1m1 0h1m1 0h1m2 0h1m1 0h1m4 0h3m1 0h1M0 16.5h1m2 0h5m4 0h2m1 0h2m2 0h2m1 0h2m1 0h1m1 0h2M1 17.5h3m4 0h4m3 0h3m1 0h1m2 0h2m1 0h1m2 0h1M0 18.5h2m4 0h2m2 0h1m2 0h3m1 0h6m3 0h1m1 0h1M3 19.5h2m2 0h1m1 0h2m3 0h1m3 0h3m1 0h1m4 0h2M0 20.5h5m1 0h1m4 0h1m1 0h2m1 0h1m2 0h7m1 0h2M8 21.5h9m1 0h1m1 0h1m3 0h1m2 0h2M0 22.5h7m1 0h2m2 0h1m2 0h1m2 0h1m1 0h1m1 0h1m1 0h3m1 0h1M0 23.5h1m5 0h1m2 0h1m2 0h2m1 0h2m1 0h3m3 0h2m1 0h2M0 24.5h1m1 0h3m1 0h1m2 0h1m1 0h1m1 0h1m1 0h2m1 0h7m2 0h2M0 25.5h1m1 0h3m1 0h1m3 0h1m1 0h2m1 0h1m3 0h1m1 0h1m2 0h1m3 0h1M0 26.5h1m1 0h3m1 0h1m1 0h2m3 0h1m1 0h4m1 0h1m3 0h1m1 0h3M0 27.5h1m5 0h1m3 0h2m4 0h1m3 0h1m3 0h2M0 28.5h7m1 0h1m1 0h1m1 0h3m1 0h1m3 0h2m1 0h2m3 0h1"/></svg>;

const Pom2FAPanel = (props: {
	fetchStatus: FetchStatusData,
	setFetchStatus: (fetchStatus: FetchStatusData) => void
}) : JSX.Element => {
	const [ authCodeStatus, setAuthCodeStatus ] = useState<TCIState>(TCIState.INITIAL);

	return (
		<div className="pom-2fa-panel">
			<div className="pom-2fa-state">
				<button>Enable 2FA Auth</button>
			</div>
			<div className="pom-2fa-content">
				<div className="pom-2fa-qrcode-container">
					{defaultQrCode}
					<button>Generate</button>
				</div>
				<div className="pom-2fa-authcode-container">
					<TFACodeInput backResponse={setAuthCodeStatus} />
				</div>
			</div>
		</div>
	);
};

export default Pom2FAPanel;