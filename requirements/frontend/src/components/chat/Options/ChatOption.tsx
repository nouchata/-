import {
	faDoorOpen,
	faGear,
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
import Admin from './Admin';
import { Members } from './Members';
import { useLogin } from '../../../Providers/LoginProvider';

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
	const { loginStatus } = useLogin();

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

	const options = useMemo(() => {
		const opts: {
			icon: IconDefinition;
			text: string;
			callback: () => void;
		}[] = [
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
			{
				icon: faUserPlus,
				text: 'Invite',
				callback: () => {},
			},
		];

		if (
			channel.admins.some((admin) => admin.id === loginStatus.user?.id) ||
			loginStatus.user?.id === channel.owner.id
		) {
			opts.push({
				icon: faGear,
				text: 'Admin',
				callback: () => setAdminModalOpen(true),
			});
		}
		return opts;
	}, [channel, loginStatus.user?.id, setModalProps]);

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
