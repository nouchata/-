import { User } from "src/user/entities/user.entity";

interface Match {
	id: number
	playerOne: User
	playerTwo: User
	error?: string
}

type MatchmakingList = {
    waiting: { user: User, time: number }[]
    finished: Match[]
}

export { MatchmakingList };
