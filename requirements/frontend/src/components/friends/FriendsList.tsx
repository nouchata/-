import FriendRow from './FriendRow';
import '../../styles/friends_list.scss';
import '../../styles/social_field.scss';
import { useFriendList } from '../../Providers/FriendListProvider';

const FriendsList = () => {
	const friendList = useFriendList();

	if (friendList.friends.length === 0) {
		return (
			<p className="friendslist-message">
				Sorry, it seems that you currently have no friends :(
			</p>
		);
	}

	return (
		<ul className="friendslist-container">
			{friendList.friends.map((friend) => {
				return <FriendRow key={friend.id} data={friend} />;
			})}
		</ul>
	);
};

export default FriendsList;
