import { User } from "./User";

enum LoginState {
	NOT_LOGGED,
	PARTIAL,
	LOGGED
};

type FetchStatusData = {
	loggedIn: LoginState,
	user?: User,
	fetched: boolean;
}

export type { FetchStatusData };
export { LoginState };
