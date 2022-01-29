import { FetchStatusData } from "../../../types/FetchStatusData";

import "./styles/general_panel.scss";
import EditAsset from "../../../assets/profile/write.png";
import { useState } from "react";

const PomGeneralPanel = (props: {
	fetchStatus: FetchStatusData,
	setFetchStatus: (fetchStatus: FetchStatusData) => void
}) : JSX.Element => {
	const [ editAvatarBtnState, setEditAvatarBtnState ] = useState<boolean>(false);

	return (
		<form className="pom-general-panel">
				<div className="pom-gp-data">
					<div className="pom-gp-avatar-container">
						<div 
							className="pom-gp-ac-content"
							onMouseEnter={() => setEditAvatarBtnState(true)}
							onMouseLeave={() => setEditAvatarBtnState(false)}
						>
							<label
								style={{visibility: (editAvatarBtnState ? 'visible' : 'hidden')}}
								htmlFor="pom-avatar-upload"
								className="pom-gp-ac-edit"
							>
								<img alt="edit avatar" src={EditAsset}/>
								<input id="pom-avatar-upload" type="file" />		
							</label>
							<img 
								src={process.env.REACT_APP_BACKEND_ADDRESS as string + 
									'/' + props.fetchStatus.user?.picture}
								alt='profile'
							/>
						</div>
					</div>
					<div className="pom-gp-text-container">
						<div className="pom-gp-tc-textfield">
							<label htmlFor="pom-login">
								Login :
							</label>
							<input id="pom-login" type="text" placeholder={props.fetchStatus.user?.login} disabled />
						</div>
						<div className="pom-gp-tc-textfield">
							<label htmlFor="pom-display-name">
								Display name :
							</label>
							<input id="pom-display-name" type="text" placeholder={props.fetchStatus.user?.displayName} />
						</div>
						<div className="pom-gp-tc-textfield">
							<label htmlFor="pom-email">
								Email :
							</label>
							<input id="pom-email" type="email" placeholder={props.fetchStatus.user?.email} />
						</div>
					</div>
				</div>
			<input className="pom-gp-save" type="submit" value="Save changes" />
		</form>
	);
};

export default PomGeneralPanel;