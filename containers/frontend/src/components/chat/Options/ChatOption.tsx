import {
	faDoorOpen,
	faGamepad,
	faGear,
	faPencil,
	faPerson,
	faUserPlus,
	IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { RequestWrapper } from '../../../utils/RequestWrapper';
import './ChatOption.scss';
import { ChannelDto } from '../types/user-channels.dto';
import { useModal } from '../../../Providers/ModalProvider';
import { useEffect, useMemo, useState } from 'react';
import Admin from './Admin/Admin';
import { useLogin } from '../../../Providers/LoginProvider';
import { Members } from './utils/Members';
import InviteFriend from './InviteFriend';
import EditChannel from './EditChannel/EditChannel';
import AddAdmin from './EditChannel/AddAdmin';
import GameCreator from '../../modals/mm-components/GameCreator';
import { useDisplay } from '../../../Providers/DisplayProvider';
import { useChat } from '../../../Providers/ChatProvider';

const Option = ({
	children,
	onClick,
	separator,
	setIsToggled,
}: {
	children: React.ReactNode;
	onClick: () => void;
	separator: boolean;
	setIsToggled: (isToggled: boolean) => void;
}) => {
	return (
		<>
			<div
				className="option"
				onClick={() => {
					onClick();
					setIsToggled(false);
				}}
			>
				{children}
			</div>
			{separator && <div className="separator-options" />}
		</>
	);
};

const ChatOption = ({ channel }: { channel: ChannelDto }) => {
	const [isToggled, setIsToggled] = useState(false);
	const { setModalProps } = useModal();
	const [adminModalOpen, setAdminModalOpen] = useState(false);
	const [inviteModalOpen, setInviteModalOpen] = useState(false);
	const { loginStatus } = useLogin();
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { displayData } = useDisplay();
	const { chatSocket } = useChat();

	useEffect(() => {
		if (adminModalOpen) {
			setModalProps({
				show: true,
				content: <Admin channel={channel} />,
				width: '80%',
				height: '80%',
				onClose: () => setAdminModalOpen(false),
			});
		}
	}, [adminModalOpen, channel, setModalProps]);

	useEffect(() => {
		if (inviteModalOpen) {
			setModalProps({
				show: true,
				content: (
					<InviteFriend
						channel={channel}
						back={() => {
							setInviteModalOpen(false);
							setModalProps(undefined);
						}}
					/>
				),
				width: '80%',
				height: '80%',
				onClose: () => setInviteModalOpen(false),
			});
		}
	}, [channel, inviteModalOpen, setModalProps]);

	const options = useMemo(() => {
		let options: {
			icon: IconDefinition;
			text: string;
			callback: () => void;
		}[] = [
			{
				icon: faPerson,
				text: 'Members',
				callback: () => {
					setModalProps({
						show: true,
						content: <Members channel={channel} />,
						width: '80%',
						height: '80%',
					});
				},
			},
		];

		if (channel.channelType === 'direct') {
			options.push({
				icon: faGamepad,
				text: 'Play together',
				callback: () => {
					const user = channel.users.find(
						(user) => user.id !== loginStatus.user?.id
					);
					setModalProps({
						show: true,
						content: <GameCreator user={user} />,
						width: '80%',
						height: '80%',
					});
				},
			});
			return options;
		}

		options = options.concat([
			{
				icon: faDoorOpen,
				text: 'Leave',
				callback: () => {
					RequestWrapper.post('/channel/leave', {
						id: channel.id,
					});
				},
			},
			{
				icon: faUserPlus,
				text: 'Invite a friend',
				callback: () => {
					setInviteModalOpen(true);
				},
			},
		]);

		if (
			channel.admins.some((admin) => admin.id === loginStatus.user?.id) ||
			loginStatus.user?.id === channel.owner.id
		) {
			options.push({
				icon: faGear,
				text: 'Admin panel',
				callback: () => setAdminModalOpen(true),
			});
		}

		if (loginStatus.user?.id === channel.owner.id) {
			options.push({
				icon: faPencil,
				text: 'Edit channel',
				callback: () => {
					setModalProps({
						show: true,
						content: <EditChannel channel={channel} />,
						width: '400px',
						height: '400px',
					});
				},
			});
			options.push({
				icon: faUserPlus,
				text: 'Manage admin',
				callback: () => {
					setModalProps({
						show: true,
						content: <AddAdmin channel={channel} />,
						width: '80%',
						height: '80%',
					});
				},
			});
		}

		return options;
	}, [channel, loginStatus.user?.id, setModalProps, chatSocket]); // eslint-disable-line

	return (
		<button title="Channels options">
			{isToggled && (
				<div className="options">
					{options.map(({ icon, text, callback }, index) => (
						<Option
							key={index}
							onClick={callback}
							separator={index !== options.length - 1}
							setIsToggled={setIsToggled}
						>
							<FontAwesomeIcon icon={icon} className="icon" />
							<span>{text}</span>
						</Option>
					))}
				</div>
			)}
			<FontAwesomeIcon
				icon={faGear}
				className="icon-options"
				onClick={() => setIsToggled(!isToggled)}
			/>
		</button>
	);
};

export default ChatOption;
