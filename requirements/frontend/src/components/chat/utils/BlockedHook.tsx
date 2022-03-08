import { createContext, useContext, useEffect, useState } from 'react';
import { RequestWrapper } from '../../../utils/RequestWrapper';
import { User } from '../types/user-channels.dto';

interface IBlocked {
	addBlocked: (id: number) => void;
	removeBlocked: (id: number) => void;
	isBlocked: (id: number) => boolean;
}

const BlockedContext = createContext<IBlocked | undefined>(undefined);

const useBlocked = () => {
	const context = useContext(BlockedContext);
	if (context === undefined) {
		throw new Error('useBlocked must be used within a BlockedProvider');
	}
	return context;
};

const BlockedProvider = ({ children }: { children: React.ReactNode }) => {
	const [blocked, setBlocked] = useState<number[]>([]);

	useEffect(() => {
		const fetchBlocked = async () => {
			const blockedUsers = await RequestWrapper.get<User[]>('/user/block/list');
			if (!blockedUsers) {
				return;
			}
			setBlocked(blockedUsers.map((user) => user.id));
		};
		fetchBlocked();
	}, []);

	const addBlocked = async (id: number) => {
		const res = await RequestWrapper.post(`/user/block/${id}`);
		if (!res)
			return;
		setBlocked((prev) => [...prev, id]);
	};

	const removeBlocked = (id: number) => {
		const res = RequestWrapper.delete(`/user/block/${id}`);
		if (!res)
			return;
		setBlocked((prev) => prev.filter((i) => i !== id));
	};

	const isBlocked = (id: number) => {
		return blocked.includes(id);
	};

	return (
		<BlockedContext.Provider
			value={{
				addBlocked,
				removeBlocked,
				isBlocked,
			}}
		>
			{children}
		</BlockedContext.Provider>
	);
};

export { BlockedProvider, useBlocked };
