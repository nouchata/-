import {
	createContext,
	ReactNode,
	useContext,
	useEffect,
	useState,
} from 'react';
import { FetchFriendsList } from '../../../types/FetchFriendsList';
import { RequestWrapper } from '../../../utils/RequestWrapper';

interface IFriendList {
	addFriend: (id: number) => void;
	addFriendByName: (name: string) => void;
	removeFriend: (id: number) => void;
	friends: FetchFriendsList[];
	isFriend: (id: number) => boolean;
}

const FriendListContext = createContext<IFriendList | undefined>(undefined);

const useFriendList = () => {
	const context = useContext(FriendListContext);
	if (context === undefined) {
		throw new Error(
			'useFriendList must be used within a FriendListProvider'
		);
	}
	return context;
};

const FriendListProvider = ({ children }: { children: ReactNode }) => {
	const [friends, setFriends] = useState<FetchFriendsList[]>([]);

	useEffect(() => {
		const fetchFriends = async () => {
			const friendsList = await RequestWrapper.get<FetchFriendsList[]>(
				'/user/friends/list',
				(e: any) => {
					alert(e);
				}
			);
			if (!friendsList) {
				return;
			}
			setFriends(friendsList);
		};
		fetchFriends();
	}, []);

	const addFriend = async (id: number) => {
		const res = await RequestWrapper.post<FetchFriendsList>(
			`/user/friends/add/${id}`
		);
		if (!res) return;
		setFriends([...friends, res]);
	};

	const addFriendByName = async (name: string) => {
		const res = await RequestWrapper.post<FetchFriendsList>(
			`/user/friends/addByName/${name}`
		);
		if (!res) return;
		setFriends([...friends, res]);
	};

	const removeFriend = async (id: number) => {
		const res = await RequestWrapper.delete(`/user/friends/delete/${id}`);
		if (!res) return;
		setFriends(friends.filter((i) => i.id !== id));
	};

	const isFriend = (id: number) => {
		return friends.some((i) => i.id === id);
	};

	return (
		<FriendListContext.Provider
			value={{
				addFriend,
				addFriendByName,
				removeFriend,
				friends,
				isFriend,
			}}
		>
			{children}
		</FriendListContext.Provider>
	);
};

export { FriendListProvider, useFriendList };
