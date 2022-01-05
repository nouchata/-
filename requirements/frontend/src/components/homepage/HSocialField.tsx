import { useState, useContext, useEffect } from 'react';
import LoadingContent from '../../LoadingContent';
import LoginContext from '../../LoginContext';

import DummyAsset from '../../assets/dummy.jpg';
import ChatAsset from '../../assets/homepage/chat.png';
import UserAsset from '../../assets/homepage/user.png';
import CloseAsset from '../../assets/chat/close.png';
import MaxAsset from '../../assets/chat/max.png';
import MinusAsset from '../../assets/chat/minus.png';
import ContainMaxAsset from '../../assets/chat/contain-max.png';
import HashAsset from '../../assets/social/hashtag.png';

import '../../styles/social_field.scss';

import Axios from 'axios';

type ChatState = { 
	state: "OPENED" | "MINIMIZED" | "CLOSED",
	name: string
};

const HSocialField = () : JSX.Element => {
	const [ isFriendTabSelected, setIsFriendTabSelected ] = useState<boolean>(false);
	const [ chatFocus, setChatFocus ] = useState<number>(NaN);
	const [ chatStatus, setChatStatus ] = useState<ChatState>({ state: 'CLOSED', name: '' });
	const [ socialData, setSocialData ] = useState<Array<JSX.Element>>();
	const { fetchStatus } = useContext(LoginContext);

	useEffect(() => {
		let fetchedChannels: Array<any>;
		let res: Array<JSX.Element> = [];
		(async() => {
			if (isFriendTabSelected) {
				return ;
			} else {
				fetchedChannels = (await Axios.get(process.env.REACT_APP_BACKEND_ADDRESS + '/user/channels/list', { withCredentials: true })).data;
				for (let channel of fetchedChannels) {
					res.push(
						<li key={channel.id} onClick={(function(chInfos) {
							function cb() {
								setChatStatus({ state: 'OPENED', name: '#' + chInfos.name });
							}
							return cb;
						})(channel)}>
							<figure>
								<img src={HashAsset} alt='Message Tab' className='hsf-content-channel-img' />
								<figcaption>{channel.name}</figcaption>
							</figure>
						</li>
					);
				}
				setSocialData(res);
			}
		})();
	}, [isFriendTabSelected]);

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
					{/* <li>
						<figure>
							<img src={HashAsset} alt='Message Tab' />
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
					</li> */}
					{socialData}
				</ul>}
			</div>
			<div className={chatToggleCSS(chatStatus)}>
				<div className='hsf-chat-controls'>
					<h2>{chatStatus.name}</h2>
					<button title='Maximize in another window'><img src={MaxAsset} alt='maximize' /></button>

					{chatStatus.state === 'OPENED' ?
						<button title='Minimize' onClick={() => setChatStatus({ state: 'MINIMIZED', name: chatStatus.name })}>
							<img src={MinusAsset} alt='minimize' />
						</button>
					:
						<button title='Maximize' onClick={() => setChatStatus({ state: 'OPENED', name: chatStatus.name })}>
							<img src={ContainMaxAsset} alt='maximize-in' />
						</button>
					}

					<button title='Close' onClick={() => setChatStatus({ state: 'CLOSED', name: chatStatus.name })}><img src={CloseAsset} alt='close' /></button>
				</div>
				<div className='hsf-chat-container'>
					<LoadingContent widget={true} image={ChatAsset} /> {/* meant to be the chat component */}
				</div>
			</div>
			<div className='hsf-btn-new'>
				<button>+ {isFriendTabSelected ? 'Add a new friend' : 'Create a new discussion'}</button>
			</div>
		</div>
	);
}

function chatToggleCSS(cs: ChatState) : string {
	let ret: string = 'hsf-chat';
	switch(cs.state) {
		case "MINIMIZED":
			ret += ' minimize-state';
			break ;
		case "CLOSED":
			ret += ' closed-state';
			break ;
	}
	return (ret);
}

export default HSocialField;