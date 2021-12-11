import { useState } from 'react';
import './styles/social_field.scss';
import LoadingContent from './LoadingContent';
import DummyAsset from './assets/dummy.jpg';
import ChatAsset from './assets/homepage/chat.png';
import UserAsset from './assets/homepage/user.png';

const HSocialField = (props: any) : JSX.Element => {
	const [ isFriendTabSelected, setIsFriendTabSelected ] = useState<boolean>(true);

	return (
		<div className='social-field'>
			<div className='hsf-tab-selector'>
				<button
				className={isFriendTabSelected ? 'hsf-btn-selected' : ''}
				onClick={() => !isFriendTabSelected && setIsFriendTabSelected(true)} >
					Friends
				</button>
				<button
				className={!isFriendTabSelected ? 'hsf-btn-selected' : ''}
				onClick={() => isFriendTabSelected && setIsFriendTabSelected(false)}>
					Messages
				</button>
			</div>
			<div className='hsf-content'>
				{isFriendTabSelected ?
				<LoadingContent widget={true} image={UserAsset} /> :
				<ul>
					<li>
						<figure>
							<img src={DummyAsset} alt='Message Tab' />
							<figcaption>display_name</figcaption>
							<div className='hsf-content-status'></div>
						</figure>
					</li>
					<li>
						<figure>
							<img src={DummyAsset} alt='Message Tab' />
							<figcaption>display_name</figcaption>
							<div className='hsf-content-notification'>9+</div>
							<div className='hsf-content-status hsf-content-status-available'></div>
						</figure>
					</li>
					<li>
						<figure>
							<img src={DummyAsset} alt='Message Tab' />
							<figcaption>display_name</figcaption>
							<div className='hsf-content-notification'>9+</div>
							<div className='hsf-content-status hsf-content-status-available'></div>
						</figure>
					</li>
					<li>
						<figure>
							<img src={DummyAsset} alt='Message Tab' />
							<figcaption>display_name</figcaption>
							<div className='hsf-content-notification'>9+</div>
							<div className='hsf-content-status hsf-content-status-available'></div>
						</figure>
					</li>
					<li>
						<figure>
							<img src={DummyAsset} alt='Message Tab' />
							<figcaption>display_name</figcaption>
							<div className='hsf-content-notification'>9+</div>
							<div className='hsf-content-status hsf-content-status-available'></div>
						</figure>
					</li>
					<li>
						<figure>
							<img src={DummyAsset} alt='Message Tab' />
							<figcaption>display_name</figcaption>
							<div className='hsf-content-notification'>9+</div>
							<div className='hsf-content-status hsf-content-status-available'></div>
						</figure>
					</li>
					<li>
						<figure>
							<img src={DummyAsset} alt='Message Tab' />
							<figcaption>display_name</figcaption>
							<div className='hsf-content-notification'>9+</div>
							<div className='hsf-content-status hsf-content-status-available'></div>
						</figure>
					</li>
					<li>
						<figure>
							<img src={DummyAsset} alt='Message Tab' />
							<figcaption>display_name</figcaption>
							<div className='hsf-content-notification'>9+</div>
							<div className='hsf-content-status hsf-content-status-available'></div>
						</figure>
					</li>
					<li>
						<figure>
							<img src={DummyAsset} alt='Message Tab' />
							<figcaption>display_name</figcaption>
							<div className='hsf-content-notification'>9+</div>
							<div className='hsf-content-status hsf-content-status-available'></div>
						</figure>
					</li>
					<li>
						<figure>
							<img src={DummyAsset} alt='Message Tab' />
							<figcaption>display_name</figcaption>
							<div className='hsf-content-notification'>9+</div>
							<div className='hsf-content-status hsf-content-status-available'></div>
						</figure>
					</li>
					<li>
						<figure>
							<img src={DummyAsset} alt='Message Tab' />
							<figcaption>display_name</figcaption>
							<div className='hsf-content-notification'>9+</div>
							<div className='hsf-content-status hsf-content-status-available'></div>
						</figure>
					</li>
				</ul>}
			</div>
			<div className='hsf-btn-new'><button>+ {isFriendTabSelected ? 'Add a new friend' : 'Create a new discussion'}</button></div>
		</div>
	);
}

export default HSocialField;