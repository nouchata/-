import { useState, useEffect, useContext, useMemo } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import LoginContext from './LoginContext';
import { FetchStatusData } from './types/FetchStatusData';
import { LoginDataSet } from './types/LoginDataSet';
// not-package-related importation
import './styles/login.scss';
import resetAsset from './assets/login/reset.png';
import tickAsset from './assets/login/tick.png';
import { RequestWrapper } from './utils/RequestWrapper';

const Login = () => {
	let [dataSet, setDataSet] = useState<LoginDataSet>({ h1: '', p: '', img: '' });
	let queryCode = useQuery().get('code');
	let history = useHistory();
	let fetchStatusValue: { fetchStatus: FetchStatusData | undefined; setFetchStatus: (fetchStatus: FetchStatusData) => void } = useContext(LoginContext);

	useEffect(() => {
		if (fetchStatusValue.fetchStatus?.loggedIn === false && !queryCode) {
			window.open(process.env.REACT_APP_BACKEND_ADDRESS as string +
				'/auth/login', 'Login 42', 'scrollbars=no,resizable=no,' +
			'status=no,location=no,toolbar=no,menubar=no,width=500,height=600');
			setDataSet({
				h1: 'Use the prompt to Log In',
				p: 'The login occurs in a popup.',
				img: resetAsset
			});
			(async () => {
				while (!fetchStatusValue.fetchStatus?.loggedIn) {
					let auth_status = await RequestWrapper.get<FetchStatusData>('/auth/status');
					auth_status && fetchStatusValue.setFetchStatus(auth_status);
					if (auth_status?.loggedIn)
						break ;
				}
				setDataSet({
					h1: 'You are logged in !',
					p: 'Please wait a moment, you\'ll be redirected to your last location.',
					img: tickAsset
				});
				setTimeout(() => history.goBack(), 2000);
			})();
		} else if (!fetchStatusValue.fetchStatus?.loggedIn && queryCode) {
			setDataSet({
				h1: 'Logging In ...',
				p: 'Please wait a moment, this window will automatically close.',
				img: resetAsset
			});
			(async () => {
				let res = await RequestWrapper.get<FetchStatusData>(
					'/auth/login',
					{ params: { code: queryCode } },
					(e: any) => {
						setDataSet({
							h1: 'Oops, an error happened :( !',
							p: e.message,
							img: 'error.png'
						});
					}
					);
				if (res) {
					setDataSet({
						h1: 'You are logged in !',
						p: 'The window will automatically close.',
						img: tickAsset
					});
				}
				setTimeout(() => window.close(), 1000);
			})();
		} else {
			setDataSet({
				h1: 'You are logged in !',
				p: 'Please wait a moment, you\'ll be redirected to your last location.',
				img: tickAsset
			});
			(async () => {
				setTimeout(() => history.goBack(), 2000);
			})();
		}
	}, []); // eslint-disable-line

	return (
		<div className="login-stuff">
			<h1>{dataSet.h1}</h1>
			{dataSet.p.length && <p>{dataSet.p}</p>}
			<img className={dataSet.img === tickAsset ? "onthespot" : "rotation"} src={dataSet.img} alt="" />
		</div>
	);
}

function useQuery() {
	const { search } = useLocation();
	return useMemo(() => new URLSearchParams(search), [search]);
}

export default Login;
