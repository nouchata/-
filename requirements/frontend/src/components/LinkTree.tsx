import { BrowserRouter as Router, Route, Link, Switch, Redirect } from 'react-router-dom';
import socketIOClient, { Socket } from "socket.io-client"; // eslint-disable-line
import { useLogin } from '../Providers/LoginProvider';
import { LoginState } from '../types/FetchStatusData';
import Game from './game/Game';
import Homepage from './homepage/Homepage';
import Login from './Login';
import Profile from './profile/Profile';
import Social from './Social';


const LinkTree = () : JSX.Element => {
	const { loginStatus } = useLogin();

	return (
		<Router>
			{loginStatus.loggedIn === LoginState.LOGGED ?
				<Switch>
					<Route path="/profile/:id"><Profile /></Route>
					<Route path="/homepage"><Homepage /></Route>
					<Route path="/game"><Game /></Route>
					<Route path="/social"><Social /></Route>
					<Route path="/"><Redirect to='/homepage' /></Route>
				</Switch>
			:
				<Switch>
					<Route path="/login"><Login /></Route>
					<Route path="/"><Redirect to='/login' /></Route>
				</Switch>
			}
		</Router>
	);
}

export default LinkTree;