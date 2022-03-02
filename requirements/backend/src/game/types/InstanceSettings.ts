import { GameInstance } from "../state/GameInstance";
import { Server } from 'socket.io';

type InstanceSettings = {
	wsServer: Server
	instanceId: number;
	gameInstances : { [instanceId: number]: GameInstance | undefined };
	associatedPlayers : { [userId: number]: number | undefined };
	playersId : { one: number, two: number };
}

export { InstanceSettings } ;