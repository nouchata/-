import { useNavigate } from 'react-router-dom';
import ChatAsset from '../../assets/homepage/chat.png';
import JoyAsset from '../../assets/homepage/joystick.png';
import { useModal } from '../../Providers/ModalProvider';
import GameCreator from '../modals/mm-components/GameCreator';
import MatchMaking from '../modals/mm-components/MatchMaking';
import StandardModal, { IStdPanelContent } from '../modals/StandardModal';
import { GenericModalProps } from '../utils/GenericModal';

const playModalContent : Array<IStdPanelContent> = [
	{ name: "Matchmaking", panel: <MatchMaking /> },
	{ name: "Custom Game", panel: <GameCreator /> }
];
const playModal : GenericModalProps = {
	show: true,
	content: <StandardModal panels={playModalContent} />,
	height: '80%',
	width: '80%'
};

const MaterialLikeBtns = () : JSX.Element => {
	const navigate = useNavigate();
	const { setModalProps } = useModal();

	return (
		<div className='material-like-fab'>
			<button title="Social" onClick={() => navigate('social')}>
				<img src={ChatAsset} alt='Chats' />
			</button>
			<button title="Play" onClick={() => setModalProps({...playModal})}>
				<img src={JoyAsset} alt='Play' />
			</button>
		</div>
	);
};

export default MaterialLikeBtns;