import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { MatchHistory } from "src/user/entities/match-history.entity";
import { User } from "src/user/entities/user.entity";
import { Repository } from "typeorm";
import { PlayerState } from "./types/PlayerState";
import { MatchmakingList } from "./types/Matchmaking"
import { GameGateway } from "./game.gateway";
import { GameOptions } from "./types/GameOptions";

@Injectable()
export class GameService {

    private list: MatchmakingList;
    public gatewayPtr: GameGateway | undefined = undefined;

    createMatch(ids: [number, number], options?: Partial<GameOptions>) {
        if (this.gatewayPtr) {
            try { // create a new game instance for the players
                return this.gatewayPtr.createInstance(ids[0], ids[1], options);
            } catch (e) {
                return -1;
            }
        }
        return 0;
    }

    async matchWaitingPlayers() {
        while (true) {
            await new Promise(resolve => setTimeout(() => { resolve(true) }, 2000));

            let i = 1;
            while (i < this.list.waiting.length) {
                // compute elo gap between the two players
                const actualDiff = this.list.waiting[i - 1].user.elo - this.list.waiting[i].user.elo;
                // every 15s the allowed elo gap is bigger by 250 elo
                const allowedDiff = 250 * (Math.floor((Date.now() - this.list.waiting[i].time) / 15000) + 1);
    
                // if the players have a fairly close level
                if (actualDiff <= allowedDiff) { // it's a match !
                    
                    this.list.finished.push({
                        playerOne: [this.list.waiting[i - 1].user, false],
                        playerTwo: [this.list.waiting[i].user, false],
                        id: 0
                    });

                    const last = this.list.finished.slice(-1)[0]; // get last match created
                    last.id = this.createMatch([last.playerOne[0].id, last.playerTwo[0].id]);
                    if (last.id > 0) { // if a new match has been created successfully
                        this.list.waiting.splice(i - 1, 2); // remove the players from the waiting list
                    }
                }
                i++;
            }
        }
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
    }

    matchmakingCheckMatch(playerId: number) : number {
        const matchIndex = this.list.finished.findIndex(match => {
            return (match.playerOne[0].id === playerId || match.playerTwo[0].id === playerId);
        });
        const match = this.list.finished[matchIndex];

        // create a new match instance
        if (this.gatewayPtr && match) {

            // set the player as ready
            match.playerOne[0].id === playerId ?
                match.playerOne[1] = true:
                match.playerTwo[1] = true;

            if (match.playerOne[1] && match.playerTwo[1]) {
                this.list.finished.splice(matchIndex, 1); // both players are ready, matchmaking is over
            }

            return match.id; // -1 is a fail, > 0 is a success
        }
        return (0);
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

        // should not happen
        if (players.length !== 2) {
            console.error('could not find players in database');
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

    computeNewEloScore(winnerElo: number, loserElo: number): number[] {
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

    constructor(
        @InjectRepository(User) private userRepo: Repository<User>,
        @InjectRepository(MatchHistory) private matchRepo: Repository<MatchHistory>    
    ) {
        this.list = { waiting: [], finished: [] };
        this.matchWaitingPlayers(); // launch matching loop
    }
}
