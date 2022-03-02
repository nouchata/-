import { useState, useEffect } from 'react';
import { RequestWrapper } from '../../../utils/RequestWrapper';
import { GetChannelDto } from '../types/get-channel.dto';
import { ChatSocket } from '../utils/ChatSocket';
import Create from './Create';
import Join from './Join';
import './JoinCreateModal.scss';

const JoinCreateModal = ({
	socket,
	existingChannels,
}: {
	socket: ChatSocket;
	existingChannels: number[];
}) => {
	const [selectedTab, setSelectedTab] = useState<'join' | 'create'>('join');
	const [channels, setChannels] = useState<GetChannelDto[]>([]);

	useEffect(() => {
		const fetchChannels = async () => {
			const channels_fetched = await RequestWrapper.get<GetChannelDto[]>(
				'/channel/publicprotected'
			);
			if (!channels_fetched) return;
			setChannels(channels_fetched);
		};
		fetchChannels();
	}, []);

	return (
		<div className="join-create-modal">
			<div className="select">
				<div
					className={`select-element ${
						selectedTab === 'join' ? 'selected' : ''
					}`}
					onClick={() => setSelectedTab('join')}
				>
					Join a channel
				</div>
				<div
					className={`select-element ${
						selectedTab === 'create' ? 'selected' : ''
					}`}
					onClick={() => setSelectedTab('create')}
				>
					Create a channel
				</div>
			</div>
			{selectedTab === 'join' ? (
				<Join
					channels={channels}
					socket={socket}
					existingChannels={existingChannels}
				/>
			) : (
				<Create socket={socket} />
			)}
		</div>
	);
};

export default JoinCreateModal;
