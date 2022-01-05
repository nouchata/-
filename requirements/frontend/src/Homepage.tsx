// import { BrowserRouter as Link, Route, Redirect } from 'react-router-dom';
import { useState, useContext } from 'react';
import HSocialField from './components/homepage/HSocialField';
import HProfileOverview from './components/homepage/HProfileOverview';
import LoginContext from './LoginContext';
import { FetchStatusData } from './types/FetchStatusData';

import ChatAsset from './assets/homepage/chat.png';
import JoyAsset from './assets/homepage/joystick.png';
import DummyAsset from './assets/dummy.jpg';


import './styles/homepage.scss';
import './styles/profile_overview.scss';

const Homepage = () : JSX.Element => {
	const userCtx : { fetchStatus: FetchStatusData } = useContext(LoginContext);

	return (
		<div>
			<div className='material-like-fab'>
				<button><img src={ChatAsset} alt='Chats'/></button>
				<button><img src={JoyAsset} alt='Play'/></button>
			</div>
			<div className='main-field'>
				<HSocialField />
				<div className='homepage-content mov-bg'>
					<div className='homepage-header'>
						<h1>Welcome back, <br /><span>{userCtx.fetchStatus.user?.displayName}</span> !</h1>
						<HProfileOverview {...userCtx.fetchStatus} />
					</div>
					<div className='homepage-widgets'>
							<div><h2>Rankings</h2><div></div></div>
							<div><h2>Rankings</h2><div></div></div>
							<div><h2>Rankings</h2><div></div></div>
							<div><h2>Rankings</h2><div></div></div>
					</div>
				</div>
			</div>
			{/*<p>coucou!</p>*/}
		</div>
	);
}

export default Homepage;