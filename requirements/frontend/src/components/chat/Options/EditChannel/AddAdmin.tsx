import { faUserMinus, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useCallback, useState } from 'react';
import { useModal } from '../../../../Providers/ModalProvider';
import { RequestWrapper } from '../../../../utils/RequestWrapper';
import { ChannelDto, User } from '../../types/user-channels.dto';
import Button from '../utils/Button';
import { Member } from '../utils/Members';

const AddAdmin = ({ channel }: { channel: ChannelDto }) => {
	const [error, setError] = useState<string>();
	const { setModalProps } = useModal();

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

	const removeAdmin = useCallback(
		async (user: User) => {
			// DELETE /channel/:channelId/admins/:userId
			const res = await RequestWrapper.delete(
				`/channel/${channel.id}/admins/${user.id}`,
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
				{channel.users.map((user, key) => {
					return (
						<Member key={key} user={user}>
							<Button
								onClick={() => {
									channel.admins.some(
										(admin) => admin.id === user.id
									)
										? removeAdmin(user)
										: addAdmin(user);
								}}
								className="ban-button"
							>
								{channel.admins.some(
									(admin) => admin.id === user.id
								) ? (
									<>
										<FontAwesomeIcon
											icon={faUserMinus}
											className="icon"
										/>
										Remove admin
									</>
								) : (
									<>
										<FontAwesomeIcon
											icon={faUserPlus}
											className="icon"
										/>
										Add admin
									</>
								)}
							</Button>
						</Member>
					);
				})}
			</div>
		</div>
	);
};

export default AddAdmin;
