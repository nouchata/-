import { UserStatus } from "../components/utils/StatusDisplay";

export type FetchFriendsList = {
    id: number,
    displayName: string,
    picture: string,
    status: UserStatus
}
