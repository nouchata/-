import { NotificationHandler } from "../../../Providers/NotificationProvider";
import { ChatSocket } from "../../chat/utils/ChatSocket";
import { ChatState } from "./HSocialField";
import Hashtag from "../../../assets/social/hashtag.png";


const ChannelList = ({
	chatSocket,
	notificationHandler,
	setSelectChannelIndex,
	setChatStatus,
}: {
	chatSocket?: ChatSocket;
	notificationHandler: NotificationHandler;
	setSelectChannelIndex: (index: number) => void;
	setChatStatus: (status: ChatState) => void;
}) => {
	return (
		<ul>
			{chatSocket?.channels.map((channel, index) => {
				return (
					<li
						key={index}
						onClick={() => {
							setSelectChannelIndex(index);
							notificationHandler?.removeNotificationContext(
								'chat'
							);
							setChatStatus({
								state: 'OPENED',
							});
						}}
					>
						<figure>
							<img
								src={Hashtag}
								alt="Message Tab"
								className="hsf-content-channel-img"
							/>
							<figcaption>{channel.name}</figcaption>
						</figure>
					</li>
				);
			})}
		</ul>
	);
}

export default ChannelList;