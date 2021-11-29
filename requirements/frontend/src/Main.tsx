import { useContext, useEffect } from 'react';
import LoginContext from './LoginContext';
import Login from './Login';
import { BrowserRouter as Router, Route, Switch, Link, Redirect } from "react-router-dom";

const Main = () => {
	let ctx = useContext(LoginContext);

	useEffect(() => {
	}, []);

	return (
		<div className='maindiv'>
			<Router>
				<Switch>
					{ !ctx[0] && <Route path='/login/update/:code'>
						<Login />
					</Route> }
					{ !ctx[0] && <Route path='/login'>
						<Login />
					</Route> }
					<Route path='/'>
						<p>{!ctx[0] ? 'not logged' : 'logged'}</p>
					</Route>
				</Switch>
			</Router>
		</div>
	);
};

export default Main;