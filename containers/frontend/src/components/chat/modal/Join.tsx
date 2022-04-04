import {
	faCheck,
	faCircleNotch,
	faGlobe,
	faKey,
	faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState, useCallback, useEffect, useRef } from 'react';
import { ChatSocket } from '../../../Providers/ChatProvider';
import { RequestWrapper } from '../../../utils/RequestWrapper';
import { GetChannelDto } from '../types/get-channel.dto';
import { ChannelDto } from '../types/user-channels.dto';

const ModalJoin = ({
	channel,
	setModalJoin,
	socket,
}: {
	channel: GetChannelDto;
	setModalJoin: (modalJoin: GetChannelDto | undefined) => void;
	socket: ChatSocket;
}) => {
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(channel.channelType === 'public');
	const [error, setError] = useState<string>();
	const ref = useRef(false);

	const joinChannel = useCallback(
		async (socket: ChatSocket) => {
			setLoading(true);
			const newChannel = await RequestWrapper.post<ChannelDto>(
				'/channel/join',
				{
					id: channel.id,
					password: password.length > 0 ? password : undefined,
				},
				(error) => {
					setError(error.response.data.message || 'Unknown error');
					setLoading(false);
				}
			);
			if (newChannel) {
				socket.addChannel(newChannel);
				setModalJoin(undefined);
			}
		},
		[channel.id, password, setModalJoin]
	);

	useEffect(() => {
		if (channel.channelType === 'public' && !ref.current) {
			ref.current = true;
			joinChannel(socket);
		}
	}, []); // eslint-disable-line
	return (
		<>
			<div className="overlay" />
			<div className="modal-join">
				{!loading && (
					<FontAwesomeIcon
						icon={faXmark}
						className="close"
						onClick={() => setModalJoin(undefined)}
					/>
				)}
				{channel.channelType === 'protected' && !loading && (
					<div className="form-password">
						<FontAwesomeIcon
							icon={faXmark}
							className="close"
							onClick={() => setModalJoin(undefined)}
						/>
						<div className="title">
							<FontAwesomeIcon icon={faKey} />
							<span>Enter the password</span>
						</div>
						<input
							type="password"
							placeholder="Password"
							className="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							onKeyPress={(e) => {
								if (e.key === 'Enter') {
									joinChannel(socket);
								}
							}}
						/>
						<div
							className="button-validate"
							onClick={() => joinChannel(socket)}
						>
							<FontAwesomeIcon icon={faCheck} />
						</div>
					</div>
				)}
				{loading && (
					<FontAwesomeIcon
						icon={faCircleNotch}
						spin
						className="loading-spinner"
					/>
				)}
				{error && <div className="error">{error}</div>}
			</div>
		</>
	);
};

const Join = ({
	channels,
	socket,
	existingChannels,
}: {
	channels: GetChannelDto[];
	socket: ChatSocket;
	existingChannels: number[];
}) => {
	const [filter, setFilter] = useState('');
	const [modalJoin, setModalJoin] = useState<GetChannelDto | undefined>(
		undefined
	);
	return (
		<div className="join">
			<input
				type="text"
				placeholder="Search"
				value={filter}
				onChange={(e) => setFilter(e.target.value)}
				className="search-bar"
			/>
			<div className="channels-cards-container">
				<div className="channels-cards">
					{channels
						.filter(
							(channel) => !existingChannels.includes(channel.id)
						)
						.filter((channel) =>
							channel.name.toLocaleLowerCase().includes(filter)
						)
						.map((channel, index) => (
							<div key={index} className="card">
								<FontAwesomeIcon
									icon={
										channel.channelType === 'public'
											? faGlobe
											: faKey
									}
									className="icon"
								/>
								<div>
									<div className="title">{channel.name}</div>
									<div className="subtitle">
										{channel.channelType}
									</div>
								</div>
								<div
									className="join-button"
									onClick={() => setModalJoin(channel)}
								>
									<p>join</p>
								</div>
							</div>
						))}
				</div>
			</div>
			{modalJoin && (
				<ModalJoin
					channel={modalJoin}
					setModalJoin={setModalJoin}
					socket={socket}
				/>
			)}
		</div>
	);
};

export default Join;
