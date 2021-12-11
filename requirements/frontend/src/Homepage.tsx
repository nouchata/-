// import { BrowserRouter as Link, Route, Redirect } from 'react-router-dom';
// import { useState } from 'react';
import HSocialField from './HSocialField';
import './styles/homepage.scss';
import ChatAsset from './assets/homepage/chat.png';
import JoyAsset from './assets/homepage/joystick.png';

const Homepage = () : JSX.Element => {

	return (
		<div>
			<div className='material-like-fab'>
				<button><img src={ChatAsset} alt='Chats'/></button>
				<button><img src={JoyAsset} alt='Play'/></button>
			</div>
			<div className='main-field'>
				<HSocialField />
				<div className='homepage-content'>
					<div className='homepage-header'>
						<h1>Welcome back, <br /><span>display_name</span> !</h1>
						<div></div>
					</div>
					<div className='homepage-widgets'>
							<div></div>
							<div></div>
							<div></div>
							<div></div>
					</div>
				</div>
			</div>
			{/*<p>coucou!</p>*/}
		</div>
	);
}

export default Homepage;