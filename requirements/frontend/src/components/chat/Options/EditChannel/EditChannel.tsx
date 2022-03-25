import { useCallback, useState } from 'react';
import { useModal } from '../../../../Providers/ModalProvider';
import { RequestWrapper } from '../../../../utils/RequestWrapper';
import { EditChannelDto } from '../../types/edit-channel.dto';
import { ChannelType, GroupChannel } from '../../types/user-channels.dto';
import Button from '../utils/Button';
import './EditChannel.scss';

/*
 ** you can edit channel name,
 ** type (private, plubic and protected),
 ** and the password
 **/
const EditChannel = ({ channel }: { channel: GroupChannel }) => {
	const { setModalProps } = useModal();
	const [type, setType] = useState(channel.channelType);
	const [name, setName] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState<string>();

	const updateChannel = useCallback(async () => {
		const editChannelDto: EditChannelDto = {
			name: name.length > 0 ? name : undefined,
			type,
			password:
				password.length > 0 && type === 'protected'
					? password
					: undefined,
		};
		const res = await RequestWrapper.post(
			`/channel/edit/${channel.id}`,
			editChannelDto,
			(e) => {
				setError(e.response?.data?.message || 'Unknown error');
			}
		);
		if (res) {
			setModalProps(undefined);
		}
	}, [channel.id, name, password, setModalProps, type]);

	return (
		<div className="edit-channel">
			<h3>Edit Channel - {channel.name}</h3>
			<p>*Leave empty if you don't want to change value</p>
			<div className="inputs">
				<div className="inputs-name">
					<p>Change Name</p>
					<input
						type="text"
						value={name}
						onChange={(e) => setName(e.target.value)}
					/>
				</div>
				<div className="inputs">
					<p>Change Type</p>
					<select
						value={type}
						onChange={(e) => setType(e.target.value as 'public' | 'private' | 'protected')}
					>
						<option value="public">Public</option>
						<option value="private">Private</option>
						<option value="protected">Protected</option>
					</select>
				</div>
				<div
					className={`inputs-password ${
						type === 'protected' ? '' : 'hidden'
					}`}
				>
					<p>Change Password</p>
					<input
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
					/>
				</div>
				<Button onClick={updateChannel} className="friend-button save">
					Save
				</Button>
				{error && <p className="error">{error}</p>}
			</div>
		</div>
	);
};

export default EditChannel;
