import React, { useState } from 'react';
import './styles/standard-modal.scss'

interface IStdPanelContent {
	name: string;
	panel: JSX.Element;
}

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

const StandardModal = (props: { panels: Array<IStdPanelContent> }) : JSX.Element => {
	const [panelSelected, setPanelSelected] = useState<number>(0);
	
	return (
		<div className="standard-modal">
			<ul className="stdmodal-navbar">
				{ props.panels.map((value, index) => (
					<li key={index}>
						<button {...values(index, panelSelected, setPanelSelected)}>
							{value.name}
						</button>
					</li>
				)) }
			</ul>
			{props.panels[panelSelected].panel || <div />}
		</div>
	);
};

export default StandardModal;
export type { IStdPanelContent };