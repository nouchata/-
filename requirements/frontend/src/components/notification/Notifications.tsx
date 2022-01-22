import { useContext } from "react";
import NotificationContext from "../../contexts/NotificationContext";
import './Notifications.scss';
import close from '../../assets/chat/close.png';
import NotificationCenter from "./NotificationCenter";

const Notifications = () => {
	const notificationHandler = useContext(NotificationContext);

	const new_notif = notificationHandler?.notifications[0]
	return (
		<>
			{
				(notificationHandler?.numberOfNotifications as number > 0) && <NotificationCenter />

			}
			{
				notificationHandler?.show_new_notification && new_notif &&
				<div className='new-notification'>
					<div key={new_notif.uuid} className='notification'>
							{
								new_notif.image &&
								<img className='notification-image' src={new_notif.image} alt='notif-pic' />
							}
							<div className="notification-content">
								<div className='notification-title'>{new_notif.name}</div>
								<div className='notification-text'>{new_notif.content}</div>
							</div>
							{
								new_notif.openAction &&
								<div className='notification-action'>
									<div
										className='notification-open-action'
										onClick={() => {
											new_notif.openAction && new_notif.openAction();
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
								onClick={() => notificationHandler.removeNotification(new_notif.uuid)}
							/>

						</div>
				</div>
			}
		</>
	);
}


export default Notifications;
