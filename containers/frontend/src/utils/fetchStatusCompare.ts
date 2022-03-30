import { FetchStatusData } from "../types/FetchStatusData";
import { User } from "../types/User";

export function fetchStatusCompare(first: FetchStatusData, second: FetchStatusData): boolean {
	if (first.loggedIn !== second.loggedIn ||
		first.fetched !== second.fetched ||
		typeof first.user !== typeof second.user)
		return false;
	if (typeof first.user !== 'undefined') {
		let keys = Object.keys(first.user as User);
		for (let key of keys) {
			if (first.user && second.user && first.user[key] !== second.user[key]) {
				if (typeof first.user[key] !== "object")
				{
					return false;
				}
				let fkeys = Object.keys(first.user[key]);
				let skeys = Object.keys(second.user[key]);
				if (fkeys.length !== skeys.length)
				{
					return false;
				}
				for (let index in first.user[key]) {
					if (first.user[key][index] !== second.user[key][index])
					{
						return false;
					}
				}
			}
		}
	}
	return true;
};