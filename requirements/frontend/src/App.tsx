import { useEffect, useMemo, useState } from 'react';
import { BrowserRouter as Router, Route, Link, Switch, Redirect } from 'react-router-dom';
import { FetchStatusData } from './types/FetchStatusData';
import LoginContext from './contexts/LoginContext';
import ModalContext from './contexts/ModalContext';
import Homepage from './Homepage';
import HSocialField from './components/homepage/HSocialField';
import Login from './Login';
import LoadingContent from './LoadingContent';
import { RequestWrapper } from './utils/RequestWrapper';
import Axios from 'axios';

import Profile from './components/profile/Profile';
import Chat from './components/chat/Chat';
import Error from './components/utils/Error';
import GenericModal from './components/utils/GenericModal';
import { GenericModalProps } from './components/utils/GenericModal';
import { User } from './types/User';

import ChatAsset from './assets/homepage/chat.png';
import JoyAsset from './assets/homepage/joystick.png';

import './styles/global.scss';
import './styles/main_layout.scss';
import './styles/profile_overview.scss';

const App = (): JSX.Element => {
	const [fetchStatus, setFetchStatus] = useState<FetchStatusData>();
	const [modalProps, setModalProps] = useState<GenericModalProps>({ show: false, content: <div /> });

	/* should consider to change that at some point */
	const fetchStatusValue = useMemo(
		() => ({ fetchStatus, setFetchStatus }),
		[fetchStatus]
	);

	useEffect(() => {
		(async () => {
			while (true) { /* 1.5s cyclic fetching of user data & backend server uptime */
				let res: FetchStatusData = {loggedIn: false, fetched: false};
				try {
					res = (await Axios.get(process.env.REACT_APP_BACKEND_ADDRESS as string + '/auth/status', { withCredentials: true })).data;
					res.fetched = true;
				} catch {}
				if (!fetchStatus || (fetchStatus && res && !fetchStatusCompare(fetchStatus, res))) {
					setFetchStatus(res);
					break ;
				}
				await new Promise((resolve) => setTimeout(() => resolve(0), 1500));
			}
		})();
	}, [fetchStatus]);

	return (
		<LoginContext.Provider value={fetchStatusValue}>
		<ModalContext.Provider value={{modalProps, setModalProps}}>
			<GenericModal {...modalProps} />
			{fetchStatus && <div className="App">
				{fetchStatus.loggedIn && /* PLAY AND CHAT BUTTONS */
					<div className='material-like-fab'> 
						<button><img src={ChatAsset} alt='Chats'/></button>
						<button><img src={JoyAsset} alt='Play'/></button>
					</div>
				}
				<div className='main-field'>
					<div className='main-content'>
						{fetchStatus.fetched ?
						<Router>
							<Switch>
								{fetchStatus.loggedIn && <Route path="/profile/:id"><Profile /></Route>}
								{fetchStatus.loggedIn && <Route path="/chat"><Chat /></Route>}
								{fetchStatus.loggedIn && <Route path="/homepage"><Homepage /></Route>}
								<Route path="/login"><Login /></Route>
								<Route path="/">
									{fetchStatus.loggedIn ?
									<Redirect to='/homepage' />
									:
									<>
										<h1> You are not logged in ! </h1>
										<div>
											<Link to="/login">Login</Link>
										</div>
									</>
									}
								</Route>
							</Switch>
						</Router>
						: <Error errorCode='503' message='Server Unreachable' />
						}
					</div>
					{fetchStatus.loggedIn && <HSocialField />} {/* CHAT AND FRIEND THING */}
				</div>
			</div>
			}
			{!fetchStatus && <LoadingContent />}
		</ModalContext.Provider>
		</LoginContext.Provider>
	);
}

function fetchStatusCompare(first: FetchStatusData, second: FetchStatusData) : boolean {
	if (first.loggedIn !== second.loggedIn || 
		first.fetched !== second.fetched ||
		typeof first.user !== typeof second.user)
		return false;
	if (typeof first.user !== 'undefined') {
		let keys = Object.keys(first.user as User);
		for (let key of keys) {
			if (first.user && second.user && first.user[key] !== second.user[key]) {
				if (typeof first.user[key] !== "object")
					return false;
				let fkeys = Object.keys(first.user[key]);
				let skeys = Object.keys(second.user[key]);
				if (fkeys.length !== skeys.length)
					return false;
				for (let index in first.user[key]) {
					if (first.user[key][index] !== second.user[key][index])
						return false;
				}
			}
		}
	}
	return true;
}

export default App;
