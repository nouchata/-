import { useState } from 'react';
import './styles/social_field.scss';
import AddFriendAsset from './assets/social/add.png';
import AddMessageAsset from './assets/social/new-message.png'

const HSocialField = (props: any) : JSX.Element => {
	return (
		<div className='social-field'>
			<div className='hsf-tab-selector'>
				<button><img src={AddFriendAsset} alt='Friend tab' /></button>
				<div className='separator'></div>
				<button><img src={AddMessageAsset} alt='Message Tab' /></button>
			</div>
			<div className='hsf-content'>x</div>
			<div className='hsf-btn-new'>x</div>
		</div>
	);
}

export default HSocialField;