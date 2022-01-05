import { useEffect, useMemo, useState } from 'react';
import { BrowserRouter as Router, Route, Link, Switch } from 'react-router-dom';
import { FetchStatusData } from './types/FetchStatusData';
import LoginContext from './LoginContext';
import Homepage from './Homepage';
import Login from './Login';
import LoadingContent from './LoadingContent';
import axios from 'axios';
import './styles/global.scss';
import Profile from './components/profile/Profile';
import Chat from './components/chat/Chat';
import Error from './components/utils/Error';

const App = (): JSX.Element => {
	const [fetchStatus, setFetchStatus] = useState<FetchStatusData>();
	const fetchStatusValue = useMemo(
		() => ({ fetchStatus, setFetchStatus }),
		[fetchStatus]
	);

	useEffect(() => {
		(async () => {
			let res: FetchStatusData = {loggedIn: false, fetched: false};
			try {
				res = (await axios.get(process.env.REACT_APP_BACKEND_ADDRESS as string + '/auth/status', { withCredentials: true })).data;
				res.fetched = true;
			} catch {}
			setFetchStatus(res);
			console.log(res);
		})();
	}, []);

	return (
		<LoginContext.Provider value={fetchStatusValue}>
			{fetchStatus && <div className="App">
				{fetchStatus.fetched ? (<Router>
					<Switch>
						<Route path="/profile/:id"><Profile /></Route>
						<Route path="/login"><Login /></Route>
						<Route path="/chat"><Chat /></Route>
						<Route path="/homepage"><Homepage /></Route>
						<Route path="/">
							<h1>
								{fetchStatus.loggedIn ? 'You are logged in !' : 'You are not logged in !'}
							</h1>
							<div>
								{
									fetchStatus.loggedIn ?
										(
											<div>
												<Link to="/chat">Go to chat</Link>
												<Link to={`/profile/${fetchStatus.user?.id}`}>Go to profile</Link>
											</div>
										) :
										<Link to="/login">Login</Link>
								}
							</div>
						</Route>
					</Switch>
				</Router>) : <Error errorCode='503' message='Server Unreachable' />}
			</div>}
			{!fetchStatus && <LoadingContent />}
		</LoginContext.Provider>
	);
}

export default App;
