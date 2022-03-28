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

	useEffect(() => {
		(async () => {
			while (true) {
				/* 1.5s cyclic fetching of user data & backend server uptime */
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
					status_data &&
					!fetchStatusCompare(loginStatus, status_data)
				) {
					setLoginStatus(status_data);
					break;
				}
				await new Promise((resolve) =>
					setTimeout(() => resolve(0), 1500)
				);
			}
		})();
	}, []); // eslint-disable-line

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
