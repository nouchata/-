export type FetchUserData = {
    general: {
        picture: string,
        name: string,
        role: string,
        creation: Date,
        status: string
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
        duration: number,
        date: Date
    }[],
    isEditable: boolean
}