import ChatAsset from '../../assets/homepage/chat.png';
import JoyAsset from '../../assets/homepage/joystick.png';

const MaterialLikeBtns = () : JSX.Element => {
	return (
		<div className='material-like-fab'>
			<button onClick={() => true}>
				<img src={ChatAsset} alt='Chats' />
			</button>
			<button>
				<img src={JoyAsset} alt='Play' />
			</button>
		</div>
	);
};

export default MaterialLikeBtns;