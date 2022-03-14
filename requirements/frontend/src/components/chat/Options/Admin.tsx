import { ChannelDto } from '../types/user-channels.dto';
import './Admin.scss';
import { BanButton, KickButton, MuteButton } from './AdminButtons';
import { Member } from './Members';

const Admin = ({ channel }: { channel: ChannelDto }) => {
	return (
		<div className="admin-panel-chat">
			<h1>Chat admin panel</h1>
			<h2>Users</h2>
			<div className="user-list">
				{channel.users.map((user, index) => (
					<Member key={index} user={user}>
						<KickButton channel={channel} user={user} />
						<MuteButton channel={channel} user={user} />
						<BanButton channel={channel} user={user} />
					</Member>
				))}
			</div>
		</div>
	);
};

export default Admin;
