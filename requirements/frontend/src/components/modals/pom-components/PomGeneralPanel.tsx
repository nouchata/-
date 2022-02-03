import { FetchStatusData } from "../../../types/FetchStatusData";

import "./styles/general_panel.scss";
import EditAsset from "../../../assets/profile/write.png";
import React, { useState } from "react";
import { RequestWrapper } from "../../../utils/RequestWrapper";

const saveBtnText : Array<string> = [
	"Save changes",
	"...",
	"Done !"
];

const PomGeneralPanel = (props: {
	fetchStatus: FetchStatusData,
	setFetchStatus: (fetchStatus: FetchStatusData) => void
}) : JSX.Element => {
	const [ editAvatarBtnState, setEditAvatarBtnState ] = useState<boolean>(false);
	const [ uploadedAvatarBlob, setUploadedAvatarBlob ] = useState<string>('');
	const [ uploadedAvatar, setUploadedAvatar ] = useState<File>();
	const [ displayName, setDisplayName ] = useState<string>('');
	const [ email, setEmail ] = useState<string>('');
	const [ saveState, setSaveState ] = useState<number>(0);

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
								style={{opacity: (editAvatarBtnState ? '1' : '0')}}
								htmlFor="pom-avatar-upload"
								className="pom-gp-ac-edit"
							>
								<img alt="edit avatar" src={EditAsset}/>
								<input 
									id="pom-avatar-upload"
									type="file"
									accept='image/*'
									onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
										if (e.target.files?.length && !e.target.files[0].type.search('image/[a-zA-Z]+')) {
											setUploadedAvatarBlob(URL.createObjectURL(e.target.files[0]));
											setUploadedAvatar(e.target.files[0]);
										}
										else {
											setUploadedAvatarBlob('');
											setUploadedAvatar(undefined);
										}
									}}
								/>
							</label>
							<img 
								src={uploadedAvatarBlob || process.env.REACT_APP_BACKEND_ADDRESS as string + 
									'/' + props.fetchStatus.user?.picture}
								alt='profile'
							/>
						</div>
						<button onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
							e.preventDefault();
							setUploadedAvatarBlob('');
							setUploadedAvatar(undefined);
						}} disabled={!uploadedAvatarBlob.length}>Reset</button>
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
							<input 
								id="pom-display-name"
								type="text"
								placeholder={props.fetchStatus.user?.displayName}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
									setDisplayName(e.target.value);
								}}
							/>
						</div>
						<div className="pom-gp-tc-textfield">
							<label htmlFor="pom-email">
								Email :
							</label>
							<input
								id="pom-email"
								type="email"
								placeholder={props.fetchStatus.user?.email}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
									setEmail(e.target.value);
								}}
							/>
						</div>
					</div>
				</div>
			<input
				className="pom-gp-save"
				type="submit"
				value={saveBtnText[saveState]}
				onClick={(e) => { 
					e.preventDefault();
					if (saveState === 0 && (uploadedAvatarBlob || email || displayName)) {
						setSaveState(1);
						(async() => {
							let form = new FormData();
							if (email)
								form.append('email', email);
							if (displayName)
								form.append('username', displayName);
							if (uploadedAvatar)
								form.append('picture', uploadedAvatar as File);
							await RequestWrapper.post('/user/edit', form);
							setSaveState(2);
							setTimeout(() => setSaveState(0), 1000);
						})();
					}
				}}
				disabled={saveState !== 0 || (!uploadedAvatarBlob && !email && !displayName)}
			/>
		</form>
	);
};

export default PomGeneralPanel;