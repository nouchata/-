import { UserStatus } from "../components/utils/StatusDisplay";

export type FetchUserData = {
    id: number;
    general: {
        picture: string,
        name: string,
        role: string,
        creation: Date,
        status: UserStatus
    },
    ranking: {
        vdRatio: [number, number],
        elo: number,
        rank: number
    },
    history: {
        id: number,
        winner: string,
        loser: string,
        score: [number, number],
        date: Date
    }[],
    isEditable: boolean
}