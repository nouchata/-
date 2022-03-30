import { forwardRef, Inject, UseGuards } from '@nestjs/common';
import {
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
	WsException,
} from '@nestjs/websockets';
import { WsGroupGuard } from 'src/auth/guards/group.guard';
import { Socket, Server } from 'socket.io';
import { User } from 'src/user/entities/user.entity';
import { GameInstance } from './state/GameInstance';
import { GameOptions } from './types/GameOptions';
import { GameAction } from './types/GameAction';
import { GameService } from './game.service';
import { ResponseState } from './types/ResponseState';
import { ChannelService } from 'src/chat/channel/channel.service';

@UseGuards(WsGroupGuard)
@WebSocketGateway({ cors: true, namespace: 'game' })
export class GameGateway {
	private userList: Set<number>;
	constructor(
		private gameService: GameService,
		@Inject(forwardRef(() => ChannelService))
		private channelService: ChannelService
	) {
		this.userList = new Set<number>();
	}

	@WebSocketServer()
	wsServer: Server;

	/* relie les instances à leur id */
	public gameInstances: { [instanceId: number]: GameInstance | undefined } =
		{};
	/* relie les joueurs à l'id de leur instance */
	private associatedPlayers: { [userId: number]: number | undefined } = {};

	afterInit() {
		this.gameService.gatewayPtr = this;
	}

	handleConnection(client: Socket & { request: { user?: User } }) {
		if (!client.request.user) return;
		this.userList.add(client.request.user.id);
	}

	handleDisconnect(client: Socket & { request: { user?: User } }) {
		if (!client.request.user) return;
		if (this.associatedPlayers[client.request.user.id])
			this.gameInstances[
				this.associatedPlayers[client.request.user.id] as number
			]?.updatePlayerNetState(client.request.user.id, false);
		this.userList.delete(client.request.user.id);
	}

	@SubscribeMessage('joinGame')
	joinGame(
		client: Socket & { request: { user: User } },
		{
			instanceId,
			forceSpectator,
		}: { instanceId: number; forceSpectator: number }
	) {
		if (this.gameInstances[instanceId] === undefined)
			throw new WsException('The given instance ID is invalid');

		if (
			this.associatedPlayers[client.request.user.id] &&
			this.associatedPlayers[client.request.user.id] !== instanceId
		)
			throw new WsException(
				"You can't spectate another game if you're playing"
			);

		client.join('game#' + instanceId);

		if (
			this.associatedPlayers[client.request.user.id] === instanceId &&
			!forceSpectator
		)
			this.gameInstances[instanceId]?.updatePlayerNetState(
				client.request.user.id,
				true
			);
	}

	@SubscribeMessage('gameActionDispatcher')
	gameActionDispatcher(
		client: Socket & { request: { user: User } },
		{
			instanceId,
			gameAction,
		}: { instanceId: number; gameAction: GameAction }
	) {
		if (this.associatedPlayers[client.request.user.id] !== instanceId)
			throw new WsException("You don't belong to the given instance ID");
		this.gameInstances[instanceId]?.injectGameAction(
			gameAction,
			client.request.user.id
		);
	}

	createInstance(
		playerOneId: number,
		playerTwoId: number,
		gameOptions: Partial<GameOptions> = {},
		sendInvitation?: boolean,
		givenInstanceId?: number
	): number {
		let instanceId: number = givenInstanceId ? givenInstanceId : 0;
		let notYetGenerated: boolean = givenInstanceId ? false : true;

		for (let i = 0; notYetGenerated && i < 3; i++) {
			instanceId = Number(
				String(playerOneId) +
					String(playerTwoId) +
					String(i + (Date.now() % 10000000))
			);
			if (!this.gameInstances[instanceId]) notYetGenerated = false;
		}

		if (notYetGenerated)
			throw new Error('A valid hash cannot be generated for now');
		if (
			this.associatedPlayers[playerOneId] ||
			this.associatedPlayers[playerTwoId]
		)
			throw new Error('One of the users is currently in a game');

		this.associatedPlayers[playerOneId] = instanceId;
		this.associatedPlayers[playerTwoId] = instanceId;

		this.gameInstances[instanceId] = new GameInstance(
			this.gameService,
			{
				wsServer: this.wsServer,
				instanceId: instanceId,
				associatedPlayers: this.associatedPlayers,
				gameInstances: this.gameInstances,
				playersId: { one: playerOneId, two: playerTwoId },
			},
			gameOptions
		);

		if (sendInvitation)
			this.channelService
				.retrieveDirectChannel([playerOneId, playerTwoId])
				.then((channel) => {
					this.channelService
						.createMessage(
							channel,
							'invitation',
							String(instanceId)
						)
						.then((message) => {
							(
								this.gameInstances[instanceId] as GameInstance
							).injectInvitationId(message.id);
							this.channelService.sendMessage(message);
						});
				});

		return instanceId;
	}

	isUserConnected(userId: number): boolean {
		return this.userList.has(userId);
	}

	isUserPlaying(userId: number): number {
		for (const gameId in this.gameInstances) {
			if (
				this.gameInstances[gameId]?.players.find((playerId: number) => {
					return playerId === userId;
				})
			)
				return parseInt(gameId); // return the game id the user is playing in
		}
		return 0; // user is not ingame
	}

	getInstanceData(instanceId: number): ResponseState | undefined {
		if (!this.gameInstances[instanceId]) return;
		return (this.gameInstances[instanceId] as GameInstance).getData();
	}
}
