interface TestUser {
	id: number
	displayName: string
	elo: number
}

type MatchmakingList = {
    waiting: { user: TestUser, time: number }[]
    finished: [TestUser, TestUser][];
}

export { TestUser, MatchmakingList };