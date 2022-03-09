import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { MatchHistory } from "src/user/entities/match-history.entity";
import { User } from "src/user/entities/user.entity";
import { Repository } from "typeorm";
import { PlayerState } from "./types/PlayerState";

@Injectable()
export class GameService {
	constructor(
        @InjectRepository(User) private userRepo: Repository<User>,
        @InjectRepository(MatchHistory) private matchRepo: Repository<MatchHistory>    
    ) {}

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
}
