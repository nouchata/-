import socketIOClient, { Socket } from "socket.io-client";
import { ResponseState } from "./types/ResponseState";



class GameWS {
	private socket : Socket;
	private stateUpdater : Function;

	private actionsToSubmit : any;
	private receivedState : ResponseState | undefined;

	constructor(instanceId: number, stateUpdater: Function) {
		this.socket = socketIOClient(
			process.env.REACT_APP_BACKEND_ADDRESS + '/game',
			{ withCredentials: true }
		);

		this.stateUpdater = stateUpdater;

		this.socket.on('exception', (e) => { console.log(e); });


		this.socket.on('stateUpdate', (newState: ResponseState) => this.recvState(newState));
		// this.socket.on('stateUpdate', () => console.log('x'));

		console.log(instanceId);
		this.socket.emit('joinGame', { instanceId: instanceId });
	}

	private recvState(newState: ResponseState) {
		
		this.receivedState = newState;
		console.log(newState);
		this.stateUpdater(newState);
	}

	getActionsToSubmit() {
		return (this.actionsToSubmit);
	}



	emit() {
	}

	destroy() {
		this.socket.disconnect();
	}
};

export { GameWS };