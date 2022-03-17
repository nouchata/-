import { faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useMemo } from 'react';
import { useFriendList } from '../../../Providers/FriendListProvider';
import { useNotificationHandler } from '../../../Providers/NotificationProvider';
import { FetchFriendsList } from '../../../types/FetchFriendsList';
import { RequestWrapper } from '../../../utils/RequestWrapper';
import { ChannelDto } from '../types/user-channels.dto';
import Button from './utils/Button';
import { Member } from './utils/Members';

const InviteFriendButton = ({
	friend,
	channel,
	back
}: {
	friend: FetchFriendsList;
	channel: ChannelDto;
	back: () => void;
}) => {
	const notifHandler = useNotificationHandler();
	const inviteFriend = async (userId: number) => {
		// POST: /channel/invite/:channelId/:userId
		await RequestWrapper.post(`/channel/invite/${channel.id}/${userId}`, undefined, (e) => {
			notifHandler.addNotification({
				name: 'Error',
				content: e.response?.data?.message || 'Unknown error',
				context: 'error',
			});
		});
		back();
	}
	return (
		<Button onClick={() => {inviteFriend(friend.id)}} className='friend-button'>
			<FontAwesomeIcon icon={faUserPlus} className="icon" />
			Invite
		</Button>
	);
};

const InviteFriend = ({ channel, back }: { channel: ChannelDto, back: () => void }) => {
	const { friends } = useFriendList();

	const friendsNotInChannel = useMemo(() => {
		return friends.filter((friend) => {
			return !channel.users.some((user) => user.id === friend.id);
		});
	}, [friends, channel]);

	return (
		<div className="invite-friend-panel">
			<h2>Invite friends</h2>
			<div className="friends">
				{friendsNotInChannel.map((friend, index) => {
					return (
						<Member key={index} user={friend}>
							<InviteFriendButton
								friend={friend}
								channel={channel}
								back={back}
							/>
						</Member>
					);
				})}
			</div>
		</div>
	);
};

export default InviteFriend;
