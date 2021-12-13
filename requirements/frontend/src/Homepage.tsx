// import { BrowserRouter as Link, Route, Redirect } from 'react-router-dom';
// import { useState } from 'react';
import HSocialField from './HSocialField';

import ChatAsset from './assets/homepage/chat.png';
import JoyAsset from './assets/homepage/joystick.png';
import DummyAsset from './assets/dummy.jpg';
import CloseAsset from './assets/profile/close.png';
import GearAsset from './assets/profile/gear.png';
import StarAsset from './assets/profile/star.png';

import './styles/homepage.scss';
import './styles/profile_overview.scss';

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
						<div className='profile-overview'>
							 <img src={DummyAsset} alt='profile' />
							 <div className='profile-overview-content'>
								<div className='profile-overview-data'>
									<h3>display_name</h3> {/* tba an a tag redirecting to profile page */}
									<div className='profile-overview-progress'>
										<p>Level:</p>
										<progress value='50' max='100'></progress>
									</div>
									<div className='profile-overview-progress'>
										<p>VS ratio:</p>
										<progress value='50' max='100'></progress>
									</div>
								</div>
								<div className='profile-overview-actions'>
									<button title='Log Out'><img src={CloseAsset} alt='btn' /></button>
									<button title='Edit Profile'><img src={GearAsset} alt='btn' /></button>
									<button title='HK'><img src={StarAsset} alt='btn' /></button>
								</div>
							 </div>
							 
						</div>
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