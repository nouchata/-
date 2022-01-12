import { useContext, useEffect, useState } from "react";
import NotificationContext from "../../contexts/NotificationContext";
import './NotificationContainer.scss';
import close from '../../assets/chat/close.png';

const NotificationContainer = () => {
	const notificationHandler = useContext(NotificationContext);
	return (
		<div className='notification-container'>
			{
				// use uuid as key
				notificationHandler &&
				notificationHandler.notifications.map(notification => {
					return (
						<div key={notification.uuid} className='notification'>
							<div className='notification-title'>{notification.name}</div>
							<div className='notification-text'>{notification.content}</div>
							{
								notification.openAction &&
								<div className='notification-open-action' onClick={notification.openAction}>
									<div className='notification-open-action-text'>Open</div>
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


export default NotificationContainer;
