import { ChannelDto } from "./types/user-channels.dto";

const SelectChannel = ({
	userChannels,
	selectedChannel,
	setSelectedChannel
} : {
	userChannels: ChannelDto[],
	selectedChannel: number,
	setSelectedChannel: (channel: number) => void
}) => {
	return (
		<div className="button-area">
				<h4>channels joined</h4>
				{
					userChannels.map((channel: ChannelDto, index: number) => {

						return (<button
							className={index === selectedChannel ? 'selected-button' : ''}
							key={index} onClick={() => setSelectedChannel(index)}>
							{channel.name}
						</button>);
					})
				}
			</div>
	)
};

export default SelectChannel;
