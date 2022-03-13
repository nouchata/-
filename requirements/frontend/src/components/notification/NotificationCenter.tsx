import { useState } from "react";
import close from '../../assets/chat/close.png';
import bell from './assets/bell.svg';
import { useNotificationHandler } from "../../Providers/NotificationProvider";

const NotificationCenter = () => {
	const notificationHandler = useNotificationHandler();
	const [open, setOpen] = useState(false);

	return (
		<div className={`notification-center ${open ? 'open' : ''}`}>
			<div className="notification-center-open-button" onClick={() => {
				setOpen(!open)
				if (notificationHandler)
					notificationHandler.show_new_notification = false;
			}}>
				<p className='notification-center-open-count'>{notificationHandler?.numberOfNotifications || 0}</p>
				<img src={bell} alt="bell" />
			</div>
			{
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


export default NotificationCenter;
