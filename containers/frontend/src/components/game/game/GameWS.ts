import socketIOClient, { Socket } from 'socket.io-client';
import { GameAction } from './types/GameAction';
import { ResponseState } from './types/ResponseState';

class GameWS {
	socket: Socket;
	instanceId: number;
	error: string | undefined;

	constructor(
		instanceId: number,
		forceSpectator: boolean,
		stateCallback: (newState: ResponseState) => void,
		errorCallback: (e: any) => void
	) {
		this.instanceId = instanceId;
		// if REACT_APP_BACKEND_ADDRESS start with http with use it + '/chat' else we just use '/chat'
		const backend_address = process.env.REACT_APP_BACKEND_ADDRESS;
		if (!backend_address)
			throw new Error('REACT_APP_BACKEND_ADDRESS is not defined');
		const url = backend_address.startsWith('http')
			? backend_address + '/game'
			: '/game';
		const path = backend_address.startsWith('http')
			? undefined
			: backend_address + '/socket.io';
		this.socket = socketIOClient(url, {
			path: path,
			withCredentials: true,
		});

		this.socket.on('exception', errorCallback);

		this.socket.on('stateUpdate', stateCallback);

		this.socket.emit('joinGame', {
			instanceId: this.instanceId,
			forceSpectator: forceSpectator ? 1 : 0,
		});
	}

	emit(gameAction: GameAction) {
		this.socket.emit('gameActionDispatcher', {
			instanceId: this.instanceId,
			gameAction,
		});
	}

	destroy() {
		if (!this.socket.disconnected)
			this.socket.disconnect();
	}
}

export { GameWS };
