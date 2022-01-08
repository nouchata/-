import { User } from "./User";

type FetchStatusData = {
	loggedIn: boolean,
	user?: User,
	fetched: boolean;
}

export type { FetchStatusData };
