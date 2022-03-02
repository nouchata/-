import {
	faCheck,
	faCircleNotch,
	faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useCallback, useEffect, useState } from 'react';
import { RequestWrapper } from '../../../utils/RequestWrapper';
import { CreateChannelDto } from '../types/create-channel.dto';
import { ChannelDto, ChannelType } from '../types/user-channels.dto';
import { ChatSocket } from '../utils/ChatSocket';

type ButtonState = 'loading' | 'error' | 'success';

const buttonSwitch = (state: ButtonState) => {
	switch (state) {
		case 'loading':
			return <FontAwesomeIcon icon={faCircleNotch} spin />;
		case 'error':
			return <FontAwesomeIcon icon={faExclamationTriangle} />;
		case 'success':
			return <FontAwesomeIcon icon={faCheck} />;
		default:
			return <></>;
	}
};

const Create = ({ socket }: { socket: ChatSocket }) => {
	const [channelName, setChannelName] = useState('');
	const [selectedChannelType, setSelectedChannelType] =
		useState<ChannelType>('protected');
	const [channelPassword, setChannelPassword] = useState('');
	const [error, setError] = useState<string>();
	const [buttonState, setButtonState] = useState<ButtonState>();
	const [timeoutToClean, setTimeoutToClean] = useState<NodeJS.Timeout>();

	const createChannel = useCallback(
		async ({ channel }: { channel: CreateChannelDto }) => {
			setButtonState('loading');
			const newChannel = await RequestWrapper.post<ChannelDto>(
				'/channel/create',
				channel,
				(error) => {
					setError(error.response.data.message || 'Unknown error');
					setButtonState('error');
				}
			);
			if (!newChannel) return;
			socket.addChannel(newChannel);
			setButtonState('success');
		},
		[setError, socket]
	);

	useEffect(() => {
		return () => {
			if (timeoutToClean) clearTimeout(timeoutToClean);
		};
	}, []);

	return (
		<div className="create">
			<div className="form">
				<div
					className="error"
					style={{
						opacity: error ? 1 : 0,
					}}
				>
					{error}
				</div>
				<div className="form-element">
					<p>Channel name</p>
					<input
						type="text"
						value={channelName}
						onChange={(e) => setChannelName(e.target.value)}
					/>
				</div>
				<div className="form-element">
					<p>Channel type</p>
					<select
						value={selectedChannelType}
						onChange={(e) =>
							setSelectedChannelType(
								e.target.value as ChannelType
							)
						}
					>
						<option>public</option>
						<option>protected</option>
						<option>private</option>
					</select>
				</div>
				{selectedChannelType === 'protected' && (
					<div className="form-element">
						<p>Password</p>
						<input
							type="password"
							value={channelPassword}
							onChange={(e) => setChannelPassword(e.target.value)}
						/>
					</div>
				)}
				<div className="form-element">
					<div
						className="button"
						onClick={async () => {
							setError(undefined);
							await createChannel({
								channel: {
									name: channelName,
									channelType: selectedChannelType,
									password:
										selectedChannelType === 'protected'
											? channelPassword
											: undefined,
								},
							});
							setChannelName('');
							setChannelPassword('');
							setTimeoutToClean(
								setTimeout(
									() => setButtonState(undefined),
									1000
								)
							);
						}}
					>
						{buttonState ? buttonSwitch(buttonState) : <>Create</>}
					</div>
				</div>
			</div>
		</div>
	);
};

export default Create;
