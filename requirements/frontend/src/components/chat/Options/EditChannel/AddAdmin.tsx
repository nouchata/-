import { faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useCallback, useMemo, useState } from 'react';
import { useModal } from '../../../../Providers/ModalProvider';
import { RequestWrapper } from '../../../../utils/RequestWrapper';
import { ChannelDto, User } from '../../types/user-channels.dto';
import Button from '../utils/Button';
import { Member } from '../utils/Members';

const AddAdmin = ({ channel }: { channel: ChannelDto }) => {
	const [error, setError] = useState<string>();
	const { setModalProps } = useModal();
	const notAdmins = useMemo(() => {
		return channel.users.filter(
			(user) =>
				!channel.admins.some((admin) => admin.id === user.id) &&
				user.id !== channel.owner.id
		);
	}, [channel.users, channel.admins, channel.owner.id]);

	const addAdmin = useCallback(
		async (user: User) => {
			// POST /channel/:channelId/admins/:userId
			const res = await RequestWrapper.post(
				`/channel/${channel.id}/admins/${user.id}`,
				undefined,
				(e) => setError(e.response?.data?.message || 'Unknown error')
			);
			if (res) setModalProps(undefined);
		},
		[channel.id, setModalProps]
	);

	return (
		<div className="add-admin">
			{error && <p className="error">{error}</p>}
			<h1>Add Admin</h1>
			<div className="members">
				{notAdmins.map((user, key) => {
					return (
						<Member key={key} user={user}>
							<Button
								onClick={() => {
									addAdmin(user);
								}}
								className="ban-button"
							>
								<FontAwesomeIcon
									icon={faUserPlus}
									className="icon"
								/>
								Add admin
							</Button>
						</Member>
					);
				})}
			</div>
		</div>
	);
};

export default AddAdmin;
