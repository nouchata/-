import { ChannelDto } from '../types/user-channels.dto';
import usePunishment from '../utils/usePunishment';
import './Admin.scss';
import AdminButtons from './AdminButtons';
import { Member } from './Members';

const Admin = ({ channel }: { channel: ChannelDto }) => {
	const punishmentsUtil = usePunishment(channel.id);

	if (!punishmentsUtil.punishments) return <h1>Loading...</h1>;

	return (
		<div className="admin-panel-chat">
			<h1>Chat admin panel</h1>
			<h2>Users</h2>
			<div className="user-list">
				{channel.users.map((user, index) => (
					<Member key={index} user={user}>
						<AdminButtons
							channel={channel}
							user={user}
							punishmentsUtil={punishmentsUtil}
						/>
					</Member>
				))}
			</div>
		</div>
	);
};

export default Admin;
