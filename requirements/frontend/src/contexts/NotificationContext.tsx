import crypto from 'crypto';
import React from 'react';

type CallBacks = {
	setNotificationHandler: (socket: NotificationHandler) => void;
}

export class NotificationNH {
	private _name: string;
	private _content: string;
	private _context: string;
	private _uuid?: string;
	private _openAction?: () => void;


	constructor(name: string, content: string, context: string, openAction?: () => void) {
		this._name = name;
		this._content = content;
		this._context = context;
		this._openAction = openAction;
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
	public addNotification(notification: NotificationNH): string {
		// generate unique uuid for notification (check if already exists)
		let uuid = crypto.randomBytes(16).toString('hex');
		while (this._notifications.find(n => n.uuid === uuid)) {
			uuid = crypto.randomBytes(16).toString('hex');
		}
		notification.uuid = uuid;
		//push front
		this._notifications.unshift(notification);
		//console.log(this._notifications);
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
