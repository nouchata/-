import { HttpException, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { MatchHistory } from "src/user/entities/match-history.entity";
import { User } from "src/user/entities/user.entity";
import { Repository } from "typeorm";
import { PlayerState } from "./types/PlayerState";
import { MatchmakingList } from "./types/Matchmaking"
import { GameGateway } from "./game.gateway";
import { GameOptions } from "./types/GameOptions";
import { ResponseState, RUNSTATE } from "./types/ResponseState";
import { ChannelService } from "src/chat/channel/channel.service";

@Injectable()
export class GameService {

    private list: MatchmakingList;
    private playersTimeout: { [playerId: number]: NodeJS.Timeout };
    public gatewayPtr: GameGateway | undefined = undefined;

    constructor(
        @InjectRepository(User) private userRepo: Repository<User>,
        @InjectRepository(MatchHistory) private matchRepo: Repository<MatchHistory>,
        @Inject(ChannelService) private channelService: ChannelService
    ) {
        this.list = { waiting: [], finished: [] };
        this.playersTimeout = {};
        this.matchWaitingPlayers(); // launch matching loop
    }

    private disconnectTimeout = (playerId: number) => {
        return setTimeout(() => {
            this.matchmakingRemovePlayer(playerId);
        }, 5000)
    };

    async createNewGame(ids: [number, number], options?: Partial<GameOptions>, sendInvitation?: boolean): Promise<number> {

        const players = await this.userRepo.findByIds(ids);
        if (players.length !== 2) {
            throw new Error('One or both of the players are not existing users.');
        }

        if (this.gatewayPtr) {
            return this.gatewayPtr.createInstance(ids[0], ids[1], options, sendInvitation);
        }
        throw new Error('Game gateway is not initialized for now, please wait.');
    }

    checkMatch(playerId: number) : { id: number, error?: string} {
        
        // reset player timeout
        clearTimeout(this.playersTimeout[playerId]);
        this.playersTimeout[playerId] = this.disconnectTimeout(playerId);

        const match = this.list.finished.find(match => {
            return (playerId === match.playerOne.id || playerId === match.playerTwo.id)
        }) // find the user in the list of matches created
        
        if (!match) {
            // find the user in the game instances
            if (this.gatewayPtr) {
                return { id: this.gatewayPtr.isUserPlaying(playerId) };
            }
            return { id: 0 };
        }

        if (match.error)
            return { id: 0, error: match.error };
        return { id: match.id };
    }

    matchmakingAddPlayer(player: User) {

        let i = 0;
        while (i < this.list.waiting.length && this.list.waiting[i].user.elo > player.elo) {
            i++;
        } // find player position in sorted list (elo desc.)

        // insert player in the waiting list where he belongs
        this.list.waiting.splice(i, 0, {
            user: player,
            time: Date.now()
        });

        // create timeout for the player
        this.playersTimeout[player.id] = this.disconnectTimeout(player.id);
    }

    matchmakingRemovePlayer(playerId: number) {
        const index = this.list.waiting.findIndex(item => {
            return item.user.id === playerId;
        }) // find the player
        if (index === -1)
            return ;

        // remove the player from the waiting list
        this.list.waiting.splice(index, 1);
    }

    getMatchId(userId: number): number {
        if (this.gatewayPtr) {
            return this.gatewayPtr.isUserPlaying(userId);
        } // find the user in the game instances

        const match = this.list.finished.find(match => {
            return (userId === match.playerOne.id || userId === match.playerTwo.id)
        }) // find the user in the list of matches created

        return match ? match.id : 0;
    }

    async saveMatchResult(
        winner: PlayerState,
        loser: PlayerState
    ) {
        let match       = new MatchHistory();
        match.date      = new Date(Date.now());
        match.winnerId  = winner.id;
        match.winScore  = winner.score;
        match.loseScore = loser.score;
        match.loserId   = loser.id;
        await this.matchRepo.insert(match);

        // look for the player entities
        let players: User[] = await this.userRepo.find({
            where: [
                { id: winner.id },
                { id: loser.id }
            ],
            relations: ['history']
        });

        if (players.length !== 2) {
            return ;
        }

        // players[0] is the winner
        players.sort((a: User, b: User) => {
            return a.id === winner.id ? -1 : 1;
        });

        // compute new elo
        const updatedElo = this.computeNewEloScore(players[0].elo, players[1].elo);
        players[0].elo = updatedElo[0];
        players[1].elo = updatedElo[1];

        // save updated players
        players.forEach(async (pl) => {
            pl.history.push(match);
            await this.userRepo.save(pl);
        });
        return updatedElo;
    }

    instanceStateRetriever(instanceId: number) : ResponseState | undefined {
        if (!this.gatewayPtr)
            throw new HttpException("The game server isn't loaded yet", 500);
        const responseState : ResponseState | undefined = this.gatewayPtr.getInstanceData(instanceId);
        if (!responseState)
            throw new HttpException("The given instanceId is invalid", 404);
        return (responseState);
    }

    async removeInvitation(invitationId: number) : Promise<boolean> {
		return await this.channelService.deleteMessage(invitationId);
	}

    private async matchWaitingPlayers() {
        while (true) {
            await new Promise(resolve => setTimeout(() => { resolve(true) }, 1000));

            let i = 1;
            while (i < this.list.waiting.length) {
                // compute elo gap between the two players
                const actualDiff = this.list.waiting[i - 1].user.elo - this.list.waiting[i].user.elo;
                // every 15s the allowed elo gap is bigger by 250 elo
                const allowedDiff = 250 * (Math.floor((Date.now() - this.list.waiting[i].time) / 15000) + 1);
    
                // if the players have a fairly close level
                if (actualDiff <= allowedDiff) { // it's a match !
                    
                    this.list.finished.push({
                        playerOne: this.list.waiting[i - 1].user,
                        playerTwo: this.list.waiting[i].user,
                        id: 0
                    });

                    const   last = this.list.finished.slice(-1)[0]; // get last match created
                    let     timer: number;
                    try {
                        last.id = await this.createNewGame([last.playerOne.id, last.playerTwo.id]);
                        timer = 120e3; // 2 minutes
                    } catch (e: any) {
                        last.id = -1;
                        last.error = e.message;
                        timer = 5e3; // 5 seconds
                    }
                    setTimeout(() => {
                        const index = this.list.finished.findIndex((match) => {
                            return match.id === last.id;
                        });
                        this.list.finished.splice(index, 1);
                    }, timer); // delete the match once the timer ends

                    this.list.waiting.splice(i - 1, 2); // remove the players from the waiting list
                }
                i++;
            }
        }
    }

    private computeNewEloScore(winnerElo: number, loserElo: number): number[] {
        const K: number = 32; // coefficient

        const R: number[] = [ // transformed rankings
            Math.pow(10, winnerElo / 400),
            Math.pow(10, loserElo / 400),
        ]

        const E: number[] = [ // expected score
            R[0] / (R[0] + R[1]),
            R[1] / (R[0] + R[1]),
        ];

        const S: number[] = [1, 0]; // actual score

        // elo computation
        const updatedElo: number[] = [
            Math.round(winnerElo + K * (S[0] - E[0])),
            Math.round(loserElo + K * (S[1] - E[1]))
        ]

        return updatedElo;
    }
}
