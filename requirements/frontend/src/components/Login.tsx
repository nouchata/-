import { useState, useEffect, useContext, useMemo } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import LoginContext from '../contexts/LoginContext';
import { FetchStatusData, LoginState } from '../types/FetchStatusData';
import { LoginDataSet } from '../types/LoginDataSet';
// not-package-related importation
import '../styles/login.scss';
import resetAsset from '../assets/login/reset.png';
import tickAsset from '../assets/login/tick.png';
import GoogleAsset from '../assets/login/google.png';
import { RequestWrapper } from '../utils/RequestWrapper';
import TFACodeInput, { TCIState } from './utils/TFACodeInput';

const Login = () => {
	const [dataSet, setDataSet] = useState<LoginDataSet>({ h1: '', p: '', img: '' });
	const queryCode = useQuery().get('code');
	const history = useHistory();
	const fetchStatusValue: { fetchStatus: FetchStatusData | undefined; setFetchStatus: (fetchStatus: FetchStatusData) => void } = useContext(LoginContext);

	useEffect(() => {
		if (!fetchStatusValue.fetchStatus?.loggedIn && !queryCode) {
			window.open(process.env.REACT_APP_BACKEND_ADDRESS as string +
				'/auth/login', 'Login 42', 'scrollbars=no,resizable=no,' +
			'status=no,location=no,toolbar=no,menubar=no,width=500,height=600');
			setDataSet({
				h1: 'Use the prompt to Log In',
				p: 'The login occurs in a popup.',
				img: resetAsset
			});
		} else if (!fetchStatusValue.fetchStatus?.loggedIn && queryCode) {
			setDataSet({
				h1: 'Logging In ...',
				p: 'Please wait a moment, this window will automatically close.',
				img: resetAsset
			});
			(async () => {
				let failedReq : boolean = false;
				await RequestWrapper.get<FetchStatusData>(
					'/auth/login',
					{ params: { code: queryCode } },
					(e: any) => {
						failedReq = true;
						setDataSet({
							h1: 'Oops, an error happened :( !',
							p: e.message,
							img: 'error.png'
						});
					}
				);
				if (!failedReq) {
					setDataSet({
						h1: '42 login step is done !',
						p: 'The window will automatically close.',
						img: tickAsset
					});
					window.close();
				}
			})();
		} else if (fetchStatusValue.fetchStatus?.loggedIn === LoginState.LOGGED) {
			setDataSet({
				h1: 'You are logged in !',
				p: 'Please wait a moment, you\'ll be redirected to your last location.',
				img: tickAsset
			});
			(async () => {
				setTimeout(() => history.goBack(), 1000);
			})();
		}
	}, [fetchStatusValue.fetchStatus]); // eslint-disable-line

	return (
		fetchStatusValue.fetchStatus?.loggedIn === LoginState.PARTIAL && !queryCode ?
			<div className="tfa-login-stuff">
				<img src={GoogleAsset} className="onthespot" alt="google auth logo" />
				<div className="login-2fa-container">
					<TFACodeInput backResponse={(arg: TCIState) => {}} />
				</div>
			</div>
		:
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
