import { Inject, Logger, UseGuards, forwardRef } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway, WebSocketServer, WsException } from '@nestjs/websockets';
import { WsGroupGuard } from 'src/auth/guards/group.guard';
import { Socket, Server } from 'socket.io';
import { User } from 'src/user/entities/user.entity'
import { OnlineStateGuard } from 'src/auth/guards/online-state.guard';
import { GameState } from './state/GameState';
import { GameOptions } from './types/GameOptions';
import { GameAction } from './types/GameAction';

@UseGuards(OnlineStateGuard)
@UseGuards(WsGroupGuard)
@WebSocketGateway({ cors: true, namespace: 'game' })
export class GameGateway {
	constructor() {
		setTimeout(() => this.createInstance(1, 2, {}, 123456), 1000); // debug
	}

	@WebSocketServer()
	wsServer: Server;

	/* relie les instances à leur id */
	private gameInstances : { [instanceId: number]: GameState | undefined } = {};
	/* relie les joueurs à l'id de leur instance */
	private associatedPlayers : { [userId: number]: number | undefined } = {};

	handleConnection() {}

	handleDisconnect(client: Socket & { request: { user: User } }) {
		if (this.associatedPlayers[client.request.user.id])
			this.gameInstances[this.associatedPlayers[client.request.user.id]].updatePlayerNetState(client.request.user.id, false);
	}

	@SubscribeMessage('joinGame')
	joinGame(client: Socket & { request: { user: User } }, { instanceId }: { instanceId: number }) {
		
		if (this.gameInstances[instanceId] === undefined)
			throw new WsException("The given instance ID is invalid");
		
		if (this.associatedPlayers[client.request.user.id] &&
			this.associatedPlayers[client.request.user.id] !== instanceId)
			throw new WsException("You can't spectate another game if you're playing");
		
		client.join("game#" + instanceId);

		if (this.associatedPlayers[client.request.user.id] === instanceId)
			this.gameInstances[instanceId].updatePlayerNetState(client.request.user.id, true);	
	}

	@SubscribeMessage('gameActionDispatcher')
	gameActionDispatcher(
		client: Socket & { request: { user: User } },
		{ instanceId, gameAction }: { instanceId: number, gameAction: GameAction }
	) {
		if (this.associatedPlayers[client.request.user.id] !== instanceId)
			throw new WsException("You don't belong to the given instance ID");
		this.gameInstances[instanceId].injectGameAction(gameAction, client.request.user.id);
	}

	createInstance(
		playerOneId: number,
		playerTwoId: number,
		gameOptions: Partial<GameOptions> = {},
		givenInstanceId?: number
	) : number {
		let instanceId : number = givenInstanceId ? givenInstanceId : 0;
		let notYetGenerated : boolean = givenInstanceId ? false : true;

		for (let i : number = 0 ; notYetGenerated && i < 3 ; i++) {
			instanceId = Number(String(playerOneId) + String(playerTwoId) + String(i + Date.now() % 10000000));
			if (!this.gameInstances[instanceId])
				notYetGenerated = false;
		}

		if (notYetGenerated)
			throw new Error('A valid hash cannot be generated for now');
		if (this.associatedPlayers[playerOneId] || this.associatedPlayers[playerTwoId])
			throw new Error('One of the users is currently in a game');

		this.associatedPlayers[playerOneId] = instanceId;
		this.associatedPlayers[playerTwoId] = instanceId;

		this.gameInstances[instanceId] = new GameState({
			wsServer: this.wsServer,
			instanceId: instanceId,
			associatedPlayers: this.associatedPlayers,
			gameInstances: this.gameInstances,
			playersId: { one: playerOneId, two: playerTwoId }
		}, gameOptions);

		return (instanceId);
	}
}
