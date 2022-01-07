import axios from "axios";
import { useEffect, useState } from "react";
import { RequestWrapper } from "../../utils/RequestWrapper";
import { GetChannelDto } from "./types/get-channel.dto";
import { JoinChannelDto } from "./types/join-channel.dto";
import { ChannelDto } from "./types/user-channels.dto";


const JoinChannel = ({ userChannels, addUserChannel }:
	{
		userChannels: ChannelDto[],
		addUserChannel: (channel: ChannelDto) => void
	}) => {
	const [channelFetched, setChannelFetched] = useState<boolean>(false);
	const [publicChannels, setPublicChannels] = useState<GetChannelDto[]>([]);
	const [protectedChannels, setProtectedChannels] = useState<GetChannelDto[]>([]);
	const [selectedChannel, setSelectedChannel] = useState<GetChannelDto | undefined>(undefined);
	const [password, setPassword] = useState<string>('');

	useEffect(() => {

		const fetchChannels = async () => {
			const publicChannels = await RequestWrapper.get<GetChannelDto[]>('/channel/public');
			const protectedChannels = await RequestWrapper.get<GetChannelDto[]>('/channel/protected');
			
			publicChannels && setPublicChannels(publicChannels);
			protectedChannels && setProtectedChannels(protectedChannels);
		}

		if (!channelFetched) {
			fetchChannels();
			setChannelFetched(true);
		}
	}, [channelFetched]);

	return (
		<div className="join-channel">
			<h3>Join a channel</h3>
			<div className="public-channels">
				<h4>Public channels</h4>
				{publicChannels.map((channel, index) => (
					<button key={index}
						onClick={() => setSelectedChannel(channel)}
					>{channel.name}</button>
				))}
			</div>
			<div className="protected-channels">
				<h4>Protected channels</h4>
				{protectedChannels.map((channel, index) => (
					<button key={index}
						onClick={() => setSelectedChannel(channel)}
					>{channel.name}</button>
				))}
			</div>
			{
				selectedChannel &&
				<div className="selected-channel">
					<h4>selected channel</h4>
					<p>{selectedChannel.name}</p>
					{
						selectedChannel.channelType === 'protected' &&
						<input
							type="password"
							placeholder="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
						/>
					}
					<button
						onClick={async () => {
							let joinChannelDto: JoinChannelDto = {
								id: selectedChannel.id,
								password: selectedChannel.channelType === 'protected' ? password : undefined
							}
							try {
								let new_channel = await RequestWrapper.post<ChannelDto>('/channel/join', joinChannelDto);
								new_channel && addUserChannel(new_channel);
							}
							catch (e) {
								console.log(e);
							}
						}
						}
					>Join</button>
				</div>
			}
		</div>
	)
}

export default JoinChannel;
