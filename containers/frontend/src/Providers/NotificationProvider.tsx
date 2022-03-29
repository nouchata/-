import { createContext, useContext, useState, useEffect } from 'react';

type CallBacks = {
	setNotificationHandler: (socket: NotificationHandler) => void;
};

export type NotificationNHOptions = {
	name: string;
	content: string;
	context: string;
	image?: string;
	openAction?: (windowWidth?: number) => void;
};

export class NotificationNH {
	private _name: string;
	private _content: string;
	private _context: string;
	private _uuid?: string;
	private _image?: string;
	private _openAction?: (windowWidth?: number) => void;

	constructor(options: NotificationNHOptions) {
		this._name = options.name;
		this._content = options.content;
		this._context = options.context;
		this._image = options.image;
		this._openAction = options.openAction;
	}

	public get name(): string {
		return this._name;
	}

	public get content(): string {
		return this._content;
	}

	public get context(): string {
		return this._context;
	}

	public get image(): string | undefined {
		return this._image;
	}

	public get uuid(): string {
		if (this._uuid) {
			return this._uuid;
		} else throw new Error('uuid is not set');
	}

	public set uuid(uuid: string) {
		this._uuid = uuid;
	}

	public get openAction(): ((windowWidth?: number) => void) | undefined {
		return this._openAction;
	}
}

export class NotificationHandler {
	private _callbacks: CallBacks;
	private _notifications: NotificationNH[];
	private _show_new_notification: boolean;
	private _show_new_notification_timeout?: NodeJS.Timeout;

	private _updateNotificationHandler() {
		const notificationHandler = new NotificationHandler(
			this._callbacks,
			this._notifications,
			this._show_new_notification,
			this._show_new_notification_timeout
		);
		this._callbacks.setNotificationHandler(notificationHandler);
	}

	private _updateNewNotification(show_new_notification: boolean) {
		if (this._show_new_notification_timeout) {
			clearTimeout(this._show_new_notification_timeout);
			this._show_new_notification_timeout = undefined;
		}
		this._show_new_notification = show_new_notification;

		if (show_new_notification) {
			this._show_new_notification_timeout = setTimeout(() => {
				this._show_new_notification = false;
				this._updateNotificationHandler();
			}, 3000);
		}
	}

	private static randomString(size: number) {
		const chars =
			'0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
		let result = '';
		for (let i = size; i > 0; --i)
			result += chars[Math.floor(Math.random() * chars.length)];
		return result;
	}

	constructor(
		callbacks: CallBacks,
		notifications?: NotificationNH[],
		show_new_notification?: boolean,
		show_new_notification_timeout?: NodeJS.Timeout
	) {
		this._callbacks = callbacks;
		this._notifications = notifications || [];
		this._show_new_notification = show_new_notification || false;
		this._show_new_notification_timeout = show_new_notification_timeout;
	}

	/*
	 ** add a notification and return the uuid created
	 */
	public addNotification(notificationOption: NotificationNHOptions): string {
		const notification = new NotificationNH(notificationOption);
		// generate unique uuid
		let uuid = NotificationHandler.randomString(10);
		// eslint-disable-next-line
		while (
			this._notifications.find(
				// eslint-disable-next-line no-loop-func
				(notification) => notification.uuid === uuid
			)
		) {
			uuid = NotificationHandler.randomString(10);
		}

		notification.uuid = uuid;

		// if there is 4 notification of the same context, remove the oldest one
		let notifications_same_context = this._notifications.filter(
			(n) => n.context === notification.context
		);
		if (notifications_same_context.length > 3) {
			// get the uuid of the oldest notification (oldest = last)
			let oldest_notification_uuid =
				notifications_same_context[
					notifications_same_context.length - 1
				].uuid;
			// remove the oldest notification
			this._notifications = this._notifications.filter(
				(n) => n.uuid !== oldest_notification_uuid
			);
		}
		// push front
		this._notifications.unshift(notification);
		this._updateNewNotification(true);
		this._updateNotificationHandler();
		return uuid;
	}

	/*
	 ** remove a notification
	 */
	public removeNotification(uuid: string): void {
		this._notifications = this._notifications.filter(
			(n) => n.uuid !== uuid
		);
		this._updateNewNotification(false);
		this._updateNotificationHandler();
	}

	/*
	 ** remove all notifications matching the context
	 */

	public removeNotificationContext(context: string): void {
		this._notifications = this._notifications.filter(
			(n) => n.context !== context
		);
		this._updateNewNotification(false);
		this._updateNotificationHandler();
	}

	/*
	 ** remove all notifications
	 */
	public removeAllNotifications(): void {
		this._notifications = [];
		this._updateNewNotification(false);
		this._updateNotificationHandler();
	}

	/*
	 ** get all notifications
	 */
	public get notifications() {
		return this._notifications;
	}

	/*
	 ** get a notification
	 */
	public getNotification(uuid: string): NotificationNH | undefined {
		return this._notifications.find((n) => n.uuid === uuid);
	}

	/*
	 ** get the number of notifications
	 */
	public get numberOfNotifications(): number {
		return this._notifications.length;
	}

	/*
	 ** get the number of notifications for a context
	 */
	public getNumberOfNotificationsForContext(context: string): number {
		return this._notifications.filter((n) => n.context === context).length;
	}

	public get show_new_notification(): boolean {
		return this._show_new_notification;
	}

	public set show_new_notification(show_new_notification: boolean) {
		this._updateNewNotification(show_new_notification);
		this._updateNotificationHandler();
	}
}

const NotificationContext = createContext<NotificationHandler | undefined>(
	undefined
);

const useNotificationHandler = () => {
	const notificationHandler = useContext(NotificationContext);
	if (!notificationHandler) {
		throw new Error(
			'useNotificationHandler must be used within a NotificationProvider'
		);
	}
	return notificationHandler;
};

const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
	const [notificationHandler, setNotificationHandler] =
		useState<NotificationHandler>();
	useEffect(() => {
		const notificationHandler = new NotificationHandler({
			setNotificationHandler: setNotificationHandler,
		});
		setNotificationHandler(notificationHandler);
	}, []);
	return (
		<NotificationContext.Provider value={notificationHandler}>
			{children}
		</NotificationContext.Provider>
	);
};

export { NotificationProvider, useNotificationHandler };