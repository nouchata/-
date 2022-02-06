import { GameState } from "../state/GameState";
import { Server } from 'socket.io';

type StateSettings = {
	wsServer: Server
	instanceId: number;
	gameInstances : { [instanceId: number]: GameState | undefined };
	associatedPlayers : { [userId: number]: number | undefined };
	playersId : { one: number, two: number };
}

export { StateSettings } ;