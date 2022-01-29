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
							{editAvatarBtnState && <label htmlFor="avatar-upload" className="pom-gp-ac-edit">
									<img alt="edit avatar" src={EditAsset} />		
							</label>}
							<input id="avatar-upload" type="file" />
							<img 
								src={process.env.REACT_APP_BACKEND_ADDRESS as string + 
									'/' + props.fetchStatus.user?.picture}
								alt='profile'
							/>
						</div>
					</div>
					<div className="pom-gp-text-container">
						x
					</div>
				</div>
			<input className="pom-gp-save" type="submit" value="Save changes" />
		</form>
	);
};

export default PomGeneralPanel;