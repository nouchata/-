import {
	createContext,
	ReactNode,
	useContext,
	useEffect,
	useState,
} from 'react';
import { FetchStatusData, LoginState } from '../types/FetchStatusData';
import { fetchStatusCompare } from '../utils/fetchStatusCompare';
import { RequestWrapper } from '../utils/RequestWrapper';

interface ILoginProvider {
	loginStatus: FetchStatusData;
	setLoginStatus: (status: FetchStatusData) => void;
}

const LoginContext = createContext<ILoginProvider | undefined>(undefined);

const useLogin = () => {
	const context = useContext(LoginContext);
	if (context === undefined) {
		throw new Error('useLogin must be used within a LoginProvider');
	}
	return context;
};

const LoginProvider = ({ children }: { children: ReactNode }) => {
	const [loginStatus, setLoginStatus] = useState<FetchStatusData>({
		loggedIn: LoginState.NOT_LOGGED,
		fetched: false,
	});
	const [intervalLogin, setIntervalLogin] = useState<NodeJS.Timeout>();

	useEffect(() => {
		intervalLogin === undefined &&
			setIntervalLogin(
				setInterval(async () => {
					let status_data: FetchStatusData = {
						loggedIn: LoginState.NOT_LOGGED,
						fetched: false,
					};
					const res = await RequestWrapper.get<FetchStatusData>(
						'/auth/status'
					);
					if (res) {
						status_data = res;
						res.fetched = true;
					}
					if (
						!loginStatus ||
						(loginStatus &&
							status_data &&
							!fetchStatusCompare(loginStatus, status_data))
					) {
						setLoginStatus(status_data);
						if (intervalLogin) {
							clearInterval(intervalLogin);
							setIntervalLogin(undefined);
						}
					}
				}, 1500)
			);
	}, [intervalLogin, loginStatus]);

	return (
		<LoginContext.Provider
			value={{
				loginStatus,
				setLoginStatus,
			}}
		>
			{children}
		</LoginContext.Provider>
	);
};

export { LoginProvider, useLogin };
