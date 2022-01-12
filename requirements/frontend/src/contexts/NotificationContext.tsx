import crypto from 'crypto';
import React from 'react';

type CallBacks = {
	setNotificationHandler: (socket: NotificationHandler) => void;
}

export type NotificationNHOptions = {
	name: string;
	content: string;
	context: string;
	image?: string;
	openAction?: () => void;
}

export class NotificationNH {
	private _name: string;
	private _content: string;
	private _context: string;
	private _uuid?: string;
	private _image?: string;
	private _openAction?: () => void;


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
		}
		else
			throw new Error('uuid is not set');
	}

	public set uuid(uuid: string) {
		this._uuid = uuid;
	}

	public get openAction(): (() => void ) | undefined {
		return this._openAction;
	}
}


export class NotificationHandler
{
	private _callbacks: CallBacks;

	private _notifications: NotificationNH[];

	private _updateNotificationHandler()
	{
		const notificationHandler = new NotificationHandler(this._callbacks, this._notifications);
		this._callbacks.setNotificationHandler(notificationHandler);
	}

	constructor(callbacks: CallBacks, notifications?: NotificationNH[]) {
		this._callbacks = callbacks;
		this._notifications = notifications || [];
	}

	/*
	** add a notification and return the uuid created
	*/
	public addNotification(notificationOption: NotificationNHOptions): string {
		const notification = new NotificationNH(notificationOption);
		// generate unique uuid for notification (check if already exists)
		let uuid = crypto.randomBytes(16).toString('hex');
		// eslint-disable-next-line
		while (this._notifications.find(notification => notification.uuid === uuid)) {
			uuid = crypto.randomBytes(16).toString('hex');
		}

		notification.uuid = uuid;

		// if there is 4 notification of the same context, remove the oldest one
		let notifications_same_context = this._notifications.filter(n => n.context === notification.context);
		if (notifications_same_context.length > 3) {
			// get the uuid of the oldest notification
			let oldest_notification_uuid = notifications_same_context[0].uuid;
			// remove the oldest notification
			this._notifications = this._notifications.filter(n => n.uuid !== oldest_notification_uuid);
		}
		// push front
		this._notifications.unshift(notification);
		this._updateNotificationHandler();
		return uuid;
	}

	/*
	** remove a notification
	*/
	public removeNotification(uuid: string): void {
		this._notifications = this._notifications.filter(n => n.uuid !== uuid);
		this._updateNotificationHandler();
	}

	/*
	** remove all notifications matching the context
	*/

	public removeNotificationContext(context: string): void {
		this._notifications = this._notifications.filter(n => n.context !== context);
		this._updateNotificationHandler();
	}

	/*
	** remove all notifications
	*/
	public removeAllNotifications(): void {
		this._notifications = [];
		this._updateNotificationHandler();
	}

	/*
	** get all notifications
	*/
	public get notifications(){
		return this._notifications;
	}

	/*
	** get a notification
	*/
	public getNotification(uuid: string): NotificationNH | undefined {
		return this._notifications.find(n => n.uuid === uuid);
	}

	/*
	** get the number of notifications
	*/
	public get numberOfNotifications(): number {
		return Object.keys(this._notifications).length;
	}

	/*
	** get the number of notifications for a context
	*/
	public  getNumberOfNotificationsForContext(context: string): number {
		return this._notifications.filter(n => n.context === context).length;
	}

}

const NotificationContext = React.createContext<NotificationHandler | undefined>(undefined);

export default NotificationContext;
