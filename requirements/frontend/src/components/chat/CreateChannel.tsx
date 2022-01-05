import axios from "axios";
import { useState } from "react";
import { ChannelType, ChannelDto } from "./types/user-channels.dto";

const CreateChannel = ({ userChannels, addUserChannel }:
	{
		userChannels: ChannelDto[],
		addUserChannel: (channel: ChannelDto) => void
	}) => {
	const [channelName, setChannelName] = useState<string>('');
	const [channelType, setChannelType] = useState<ChannelType>('public');
	const [channelPassword, setChannelPassword] = useState<string>('');

	return (
		<div className="create-channel">
			<h3>Create Channel</h3>
			<div className="create-channel-form">
				<input
					type="text"
					placeholder="Channel Name"
					value={channelName}
					onChange={(e) => setChannelName(e.target.value)}
				/>
				<select
					value={channelType}
					onChange={(e) => setChannelType(e.target.value as ChannelType)}
				>
					<option value="public">Public</option>
					<option value="private">Private</option>
					<option value="protected">Protected</option>
				</select>
				{
					channelType === 'protected' &&
					<input
						type="password"
						placeholder="Password"
						value={channelPassword}
						onChange={(e) => setChannelPassword(e.target.value)}
					/>
				}
				<button onClick={async () => {
					try {
						let res = await axios.post<ChannelDto>(process.env.REACT_APP_BACKEND_ADDRESS + '/channel/create', {
							name: channelName,
							channelType: channelType,
							// if channel type is protected, password is required
							password: channelType === 'protected' ? channelPassword : undefined
						}, { withCredentials: true })
						addUserChannel(res.data);
					}
					catch (e: any) {
						console.log(e);
					}
					
					setChannelName('');
					setChannelType('public');
					setChannelPassword('');

				}}>Create</button>
			</div>
		</div>
	);
}

export default CreateChannel;
