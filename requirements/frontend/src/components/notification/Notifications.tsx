import { useContext } from "react";
import NotificationContext from "../../contexts/NotificationContext";
import './Notifications.scss';
import close from '../../assets/chat/close.png';

const Notifications = () => {
	const notificationHandler = useContext(NotificationContext);
	return (
		<div className='notification-center'>
			{
				// use uuid as key
				notificationHandler &&
				notificationHandler.notifications.map(notification => {
					return (
						<div key={notification.uuid} className='notification'>
							{
								notification.image &&
								<img className='notification-image' src={notification.image} alt='notif-pic' />
							}
							<div className="notification-content">
								<div className='notification-title'>{notification.name}</div>
								<div className='notification-text'>{notification.content}</div>
							</div>
							{
								notification.openAction &&
								<div className='notification-action'>
									<div
										className='notification-open-action'
										onClick={() => {
											notification.openAction && notification.openAction();
											notificationHandler?.removeNotificationContext('chat');

										}}
									>
										<div className='notification-open-action-text'>Open</div>
									</div>
								</div>
							}
							<img
								className='notification-close'
								src={close}
								alt='close'
								onClick={() => notificationHandler.removeNotification(notification.uuid)}
							/>

						</div>
					);
				})
			}
		</div>
	);
}


export default Notifications;
