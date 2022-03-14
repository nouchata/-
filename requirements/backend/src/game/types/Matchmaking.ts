import { User } from "src/user/entities/user.entity";

interface Match {
	playerOne: [User, boolean],
	playerTwo: [User, boolean],
	id: number
}

type MatchmakingList = {
    waiting: { user: User, time: number }[]
    finished: Match[];
}

export { MatchmakingList };