import Error from './components/utils/Error';
import GenericModal from './components/utils/GenericModal';

import './styles/global.scss';
import './styles/main_layout.scss';
import './styles/profile_overview.scss';
import { DisplayProvider, useDisplay } from './Providers/DisplayProvider';
import { LoginProvider, useLogin } from './Providers/LoginProvider';
import { NotificationProvider } from './Providers/NotificationProvider';
import { ModalProvider, useModal } from './Providers/ModalProvider';
import { FriendListProvider } from './Providers/FriendListProvider';
import { BlockedProvider } from './Providers/BlockedProvider';
import Notifications from './components/notification/Notifications';
import LinkTree from './components/LinkTree';
import { LoginState } from './types/FetchStatusData';
import HSocialField from './components/homepage/HSocialField';
import Compose from './utils/Compose';
import { BrowserRouter as Router } from "react-router-dom";
import MaterialLikeBtns from './components/homepage/MaterialLikeBtns';

const TransApp = () => {
	const { loginStatus } = useLogin();
	const { displayData } = useDisplay();
	const { modalProps } = useModal();

	return (
		<Router>
			{loginStatus.loggedIn === LoginState.LOGGED && (
				<>
					<GenericModal modalOptions={modalProps} />
					<Notifications />
				</>
			)}
			<div className="App">
				{loginStatus.loggedIn === LoginState.LOGGED &&
					!displayData.hideButtons && <MaterialLikeBtns />}
				<div className="main-field">
					<div
						className="main-content"
						style={
							displayData.hideMainContainerStyle
								? { padding: 0 }
								: {}
						}
					>
						{loginStatus.fetched ? (
							<LinkTree />
						) : (
							<Error
								errorCode="503"
								message="Server Unreachable"
							/>
						)}
					</div>
					{loginStatus.loggedIn === LoginState.LOGGED &&
						!displayData.hideSidebar && <HSocialField />}{' '}
				</div>
			</div>
		</Router>
	);
};

const ContextLoader = () => {
	const { loginStatus } = useLogin();

	if (loginStatus.loggedIn === LoginState.LOGGED) {
		return (
			<Compose components={[FriendListProvider, BlockedProvider]}>
				<TransApp />
			</Compose>
		);
	} else {
		return <TransApp />;
	}
};

const App = (): JSX.Element => {
	return (
		<Compose
			components={[
				DisplayProvider,
				LoginProvider,
				NotificationProvider,
				ModalProvider,
			]}
		>
			<ContextLoader />
		</Compose>
	);
};

export default App;
