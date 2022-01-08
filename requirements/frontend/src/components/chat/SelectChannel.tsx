import { ChannelDto } from "./types/user-channels.dto";

const SelectChannel = ({
	channels,
	selectChannelIndex,
	setSelectChannelIndex
}: {
	channels: ChannelDto[] | undefined,
	selectChannelIndex: number,
	setSelectChannelIndex: (index: number) => void
}) => {
	return (
		<div className="select-channel">
			<h5 className="channel-title">Select a channel: </h5>
			{
				channels?.map((channel, index) => (
					<div
						key={channel.id}
						className={`channel-item ${selectChannelIndex === index ? 'selected' : ''}`}
						onClick={() => setSelectChannelIndex(index)}
					>
						{channel.name}
					</div>
				))
			}
		</div>
	)
}

export default SelectChannel;
