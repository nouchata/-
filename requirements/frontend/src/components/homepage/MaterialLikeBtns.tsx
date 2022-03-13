import { useNavigate } from 'react-router-dom';
import ChatAsset from '../../assets/homepage/chat.png';
import JoyAsset from '../../assets/homepage/joystick.png';

const MaterialLikeBtns = () : JSX.Element => {
	const navigate = useNavigate();

	return (
		<div className='material-like-fab'>
			<button title="Social" onClick={() => navigate('social')}>
				<img src={ChatAsset} alt='Chats' />
			</button>
			<button>
				<img src={JoyAsset} alt='Play' />
			</button>
		</div>
	);
};

export default MaterialLikeBtns;