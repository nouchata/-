import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { MatchHistory } from "src/user/entities/match-history.entity";
import { User } from "src/user/entities/user.entity";
import { Repository } from "typeorm";
import { PlayerState } from "./types/PlayerState";
import { TestUser, MatchmakingList } from "./types/Matchmaking"

@Injectable()
export class GameService {

    private list: MatchmakingList;

    async matchWaitingPlayers() {
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
                    this.list.finished.push([this.list.waiting[i - 1].user, this.list.waiting[i].user])
                    this.list.waiting.splice(i - 1, 2); // remove them from waiting list
                }
    
                i++;
            }
        }
    }

    matchmakingAddPlayer(player: TestUser) {

        let i = 0;
        while (i < this.list.waiting.length && this.list.waiting[i].user.elo > player.elo) {
            i++;
        } // find player position in sorted list (elo desc.)

        // insert player in the waiting list where he belongs
        this.list.waiting.splice(i, 0, {
            user: player,
            time: Date.now()
        });
        return this.list;
    }

    matchmakingCheckMatch(playerId: number) {
        const match = this.list.finished.find(match => {
            return (match[0].id === playerId || match[1].id === playerId);
        });

        if (!match)
            return null;

        // create a new match instance
        // return its id
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
