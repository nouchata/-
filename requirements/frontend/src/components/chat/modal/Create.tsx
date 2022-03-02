import { useState } from 'react';
import { RequestWrapper } from '../../../utils/RequestWrapper';
import { CreateChannelDto } from '../types/create-channel.dto';
import { ChannelDto, ChannelType } from '../types/user-channels.dto';
import { ChatSocket } from '../utils/ChatSocket';

const Create = ({ socket }: { socket: ChatSocket }) => {
	const [channelName, setChannelName] = useState('');
	const [selectedChannelType, setSelectedChannelType] =
		useState<ChannelType>('protected');
	const [channelPassword, setChannelPassword] = useState('');

	const createChannel = async ({
		socket,
		channel,
	}: {
		socket: ChatSocket;
		channel: CreateChannelDto;
	}) => {
		const newChannel = await RequestWrapper.post<ChannelDto>(
			'/channel/join',
			channel
		);
		if (!newChannel) return;
		socket.addChannel(newChannel);
	};

	return (
		<div>
			<div className="form">
				<div className="form-element">
					<p>Channel name</p>
					<input
						type="text"
						value={channelName}
						onChange={(e) => setChannelName(e.target.value)}
					/>
				</div>
				<div className="form-element">
					<p>Channel type</p>
					<select
						value={selectedChannelType}
						onChange={(e) =>
							setSelectedChannelType(
								e.target.value as ChannelType
							)
						}
					>
						<option>public</option>
						<option>protected</option>
						<option>private</option>
					</select>
				</div>
				{selectedChannelType === 'protected' && (
					<div className="form-element">
						<p>Password</p>
						<input
							type="password"
							value={channelPassword}
							onChange={(e) => setChannelPassword(e.target.value)}
						/>
					</div>
				)}
				<div className="form-element">
					<button
						onClick={() =>
							createChannel({
								socket,
								channel: {
									name: channelName,
									channelType: selectedChannelType,
									password: channelPassword,
								},
							})
						}
					>
						Create
					</button>
				</div>
			</div>
		</div>
	);
};

export default Create;
