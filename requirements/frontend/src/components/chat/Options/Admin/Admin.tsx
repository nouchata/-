import { useMemo } from 'react';
import { ChannelDto } from '../../types/user-channels.dto';
import usePunishment from '../../utils/usePunishment';
import { Member } from '../utils/Members';
import './Admin.scss';
import AdminButtons, { SeeSanctionsButton, UnBanButton } from './AdminButtons';

const Admin = ({ channel }: { channel: ChannelDto }) => {
	const punishmentsUtil = usePunishment(channel.id);

	const bannedUser = useMemo(() => {
		if (!punishmentsUtil.punishments) return [];
		return punishmentsUtil
			.getAllActivePunishmentsType('ban')
			.map((p) => p.user);
	}, [punishmentsUtil]);

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
			{bannedUser.length > 0 && (
				<>
					<h2>Banned users</h2>
					<div className="user-list">
						{bannedUser.map((user, index) => (
							<Member key={index} user={user}>
								<UnBanButton
									channel={channel}
									user={user}
									punishmentsUtil={punishmentsUtil}
								/>
								<SeeSanctionsButton
									channel={channel}
									user={user}
									punishmentsUtil={punishmentsUtil}
								/>
							</Member>
						))}
					</div>
				</>
			)}
		</div>
	);
};

export default Admin;
