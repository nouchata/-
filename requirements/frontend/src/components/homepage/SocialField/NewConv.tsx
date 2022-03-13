import { useEffect, useMemo, useState } from 'react';
import { useModal } from '../../../Providers/ModalProvider';
import JoinCreateModal from '../../chat/modal/JoinCreateModal';
import { ChatSocket } from '../../chat/utils/ChatSocket';
import AddFriendModal from '../../friends/modal/AddFriendModal';
import { GenericModalProps } from '../../utils/GenericModal';

const NewConv = ({
	chatSocket,
	isFriendTabSelected,
	AddFriend,
}: {
	chatSocket?: ChatSocket;
	isFriendTabSelected: boolean;
	AddFriend: (name: string) => Promise<void>;
}) => {
	const { setModalProps } = useModal();
	const [isModalOpen, setIsModalOpen] = useState(false);

	const friendModalSettings: GenericModalProps = {
		show: true,
		content: <AddFriendModal cb={AddFriend} />,
		width: '25%',
	};

	const existingChannels = useMemo(() => {
		if (!chatSocket) return [];
		return chatSocket?.channels.map((channel) => channel.id);
	}, [chatSocket]);

	useEffect(() => {
		if (isModalOpen && chatSocket) {
			setModalProps({
				show: true,
				content: (
					<JoinCreateModal
						socket={chatSocket}
						existingChannels={existingChannels}
					/>
				),
				height: '50%',
				width: '85%',
				maxWidth: '500px',
				onClose: () => setIsModalOpen(false),
			});
		}
	}, [isModalOpen, chatSocket, existingChannels, setModalProps]);

	return (
		<div className="hsf-btn-new">
			<button
				onClick={() => {
					if (!chatSocket) return;
					isFriendTabSelected
						? setModalProps(friendModalSettings)
						: setIsModalOpen(true);
				}}
			>
				+{' '}
				{isFriendTabSelected
					? 'Add a new friend'
					: 'Create a new discussion'}
			</button>
		</div>
	);
};

export default NewConv;
