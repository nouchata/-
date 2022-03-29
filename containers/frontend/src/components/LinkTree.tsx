import { Navigate, Route, Routes } from 'react-router-dom';
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
		<>
			{loginStatus.loggedIn === LoginState.LOGGED ?
				<Routes>
					<Route path="profile">
						<Route path=":id" element={<Profile />}></Route>
					</Route>
					<Route path="homepage" element={<Homepage />}></Route>
					<Route path="game" element={<Game />}></Route>
					<Route path="social" element={<Social />}></Route>
					<Route path="*" element={<Navigate to='homepage' />}></Route>
				</Routes>
			:
				<Routes>
					<Route path="login" element={<Login />}></Route>
					<Route path="*" element={<Navigate to='login' />}></Route>
				</Routes>
			}
		</>
	);
}

export default LinkTree;