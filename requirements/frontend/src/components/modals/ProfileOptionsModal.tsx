import React, { useState } from 'react';
import { useLogin } from '../../Providers/LoginProvider';
import Pom2FAPanel from './pom-components/Pom2FAPanel';
import PomGeneralPanel from './pom-components/PomGeneralPanel';
import './styles/mprofile_options.scss'

const values = (panel: number, ps: number, sps: (ps: number) => void) => {
	return ({
		style: panel === ps ? {
			fontWeight: 700,
			color: 'black'
		} : {},
		onClick: (e: React.MouseEvent<HTMLElement>) => {
			if (panel !== ps)
				sps(panel);
		}
	});
}

const ProfileOptionsModal = () : JSX.Element => {
	const { loginStatus } = useLogin();
	const [panelSelected, setPanelSelected] = useState<number>(0);

	const panels : Array<JSX.Element> = [ 
		<PomGeneralPanel fetchStatus={loginStatus}/>,
		<Pom2FAPanel fetchStatus={loginStatus} />
	];
	
	return (
		<div className="profile-options-modal">
			<ul className="pom-navbar">
				<li key='0'>
					<button {...values(0, panelSelected, setPanelSelected)}>
						General
					</button>
				</li>
				<li key='1'>
					<button {...values(1, panelSelected, setPanelSelected)}>
						2FA
					</button>
				</li>
			</ul>
			{panels[panelSelected] || <div />}
		</div>
	);
};

export default ProfileOptionsModal;