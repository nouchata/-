import { useEffect, useMemo, useState } from 'react';
import { FetchStatusData, LoginState } from './types/FetchStatusData';
import LoginContext from './contexts/LoginContext';
import ModalContext from './contexts/ModalContext';
import HSocialField from './components/homepage/HSocialField';
import LoadingContent from './utils/LoadingContent';
import { RequestWrapper } from './utils/RequestWrapper'; // eslint-disable-line

import Error from './components/utils/Error';
import GenericModal from './components/utils/GenericModal';
import { GenericModalProps } from './components/utils/GenericModal';

import ChatAsset from './assets/homepage/chat.png';
import JoyAsset from './assets/homepage/joystick.png';

import './styles/global.scss';
import './styles/main_layout.scss';
import './styles/profile_overview.scss';
import NotificationContext, { NotificationHandler } from './contexts/NotificationContext';
import Notifications from './components/notification/Notifications';
import DisplayContext from './contexts/HideDisplayContext';
import { fetchStatusCompare } from './utils/fetchStatusCompare';
import LinkTree from './components/LinkTree';
import { HideDisplayData } from './types/HideDisplayData';

const App = (): JSX.Element => {
	const [fetchStatus, setFetchStatus] = useState<FetchStatusData>();
	const [modalProps, setModalProps] = useState<GenericModalProps>({ show: false, content: <div /> });
	const [notificationHandler, setNotificationHandler] = useState<NotificationHandler>();
	const [hideDisplay, setHideDisplay] = useState<HideDisplayData>({});

	useEffect(() => {
		if (!notificationHandler)
			setNotificationHandler(new NotificationHandler({
				setNotificationHandler: setNotificationHandler,
			}));
	}, [notificationHandler]);

	/* should consider to change that at some point */
	const fetchStatusValue = useMemo(
		() => ({ fetchStatus, setFetchStatus }),
		[fetchStatus]
	);

	// TODO: transform this into a websocket (socket.io)
	useEffect(() => {
		(async () => {
			while (true) { /* 1.5s cyclic fetching of user data & backend server uptime */
				let status_data: FetchStatusData = { loggedIn: LoginState.NOT_LOGGED, fetched: false };
				const res = await RequestWrapper.get<FetchStatusData>('/auth/status');
				if (res) {
					status_data = res;
					res.fetched = true;
				}
				if (!fetchStatus || (fetchStatus && status_data && !fetchStatusCompare(fetchStatus, status_data))) {
					setFetchStatus(status_data);
					break;
				}
				await new Promise((resolve) => setTimeout(() => resolve(0), 1500));
			}
		})();
	}, [fetchStatus]);

	return (
		<DisplayContext.Provider value={[hideDisplay, setHideDisplay]}>
			<LoginContext.Provider value={fetchStatusValue}>
				<NotificationContext.Provider value={notificationHandler}>
					<ModalContext.Provider value={{ modalProps, setModalProps }}>
						{fetchStatus?.loggedIn === LoginState.LOGGED &&
							<>
								<GenericModal {...modalProps} />
								<Notifications />
							</>
						}
						{fetchStatus && <div className="App">
							{fetchStatus.loggedIn === LoginState.LOGGED &&
							!hideDisplay.hideButtons && /* PLAY AND CHAT BUTTONS */
								<div className='material-like-fab'>
									<button><img src={ChatAsset} alt='Chats' /></button>
									<button><img src={JoyAsset} alt='Play' /></button>
								</div>
							}
							<div className='main-field'>
								<div className='main-content' style={hideDisplay.hideMainContainerStyle ? {padding: 0} : {}}>
									{fetchStatus.fetched ?
										<LinkTree />
										:
										<Error errorCode='503' message='Server Unreachable' />
									}
								</div>
								{fetchStatus.loggedIn === LoginState.LOGGED &&
								!hideDisplay.hideSidebar &&
									<HSocialField />
								} {/* CHAT AND FRIEND THING */}
							</div>
						</div>
						}
						{!fetchStatus && <LoadingContent />}
					</ModalContext.Provider>
				</NotificationContext.Provider>
			</LoginContext.Provider>
		</DisplayContext.Provider>
	);
}

export default App;
