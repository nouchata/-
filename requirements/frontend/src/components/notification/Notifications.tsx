import { useContext } from "react";
import NotificationContext from "../../contexts/NotificationContext";
import './Notifications.scss';
import NotificationCenter from "./NotificationCenter";

const Notifications = () => {
	const notificationHandler = useContext(NotificationContext);

	if (notificationHandler?.numberOfNotifications as number > 0) {
		return (
			<NotificationCenter />
		);
	}
	else
		return (
			<>
			</>
		);
}


export default Notifications;
