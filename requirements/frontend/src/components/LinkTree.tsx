import { BrowserRouter as Router, Route, Link, Switch, Redirect } from 'react-router-dom';
import socketIOClient, { Socket } from "socket.io-client"; // eslint-disable-line
import { useLogin } from '../Providers/LoginProvider';
import { LoginState } from '../types/FetchStatusData';
import Game from './game/Game';
import Homepage from './homepage/Homepage';
import Login from './Login';
import Profile from './profile/Profile';


const LinkTree = () : JSX.Element => {
	const { loginStatus } = useLogin();

	return (
		<Router>
			{loginStatus.loggedIn === LoginState.LOGGED ?
				<Switch>
					<Route path="/profile/:id"><Profile /></Route>
					<Route path="/homepage"><Homepage /></Route>
					<Route path="/game"><Game /></Route>
					<Route path="/test">
						<button onClick={(e) => {
							let gsocket = socketIOClient(
								process.env.REACT_APP_BACKEND_ADDRESS + '/game',
								{ withCredentials: true });
							gsocket.on("exception", (args: any) => {
								console.log(args);
							});
							// console.log(gsocket);
							gsocket.emit("joinGame", { instanceId: 400000 });
						}}>
							CLICK
						</button>
					</Route>
					<Route path="/"><Redirect to='/homepage' /></Route>
				</Switch>
			:
				<Switch>
					<Route path="/login"><Login /></Route>
					<Route path="/">
						<h1> You are not logged in ! </h1>
						<div>
							<Link to="/login">Login</Link>
						</div>
					</Route>
				</Switch>
			}
		</Router>
	);
}

export default LinkTree;