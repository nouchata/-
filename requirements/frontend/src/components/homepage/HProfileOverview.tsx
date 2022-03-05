
import { FetchStatusData } from '../../types/FetchStatusData';
import { BrowserRouter as Router, Link } from 'react-router-dom'; // eslint-disable-line
import { getVictoryRatio } from '../profile/UserDetails';

import CloseAsset from '../../assets/profile/close.png';
import GearAsset from '../../assets/profile/gear.png';
import StarAsset from '../../assets/profile/star.png';
import { GenericModalProps } from '../utils/GenericModal';
import ProfileOptionsModal from '../modals/ProfileOptionsModal';
import { useContext } from 'react';
import ModalContext from '../../contexts/ModalContext';
import { RequestWrapper } from '../../utils/RequestWrapper';

//import '../../styles/profile_overview.scss';

const profileOptsModal : GenericModalProps = {
	show: true,
	content: <ProfileOptionsModal />,
	height: '80%',
	width: '80%'
}

const ProfileOverview = (fetchStatus: FetchStatusData) : JSX.Element => {
	const { setModalProps } = useContext(ModalContext);

	return (
		<div className='profile-overview'>
			<Link to={`/profile/${fetchStatus.user?.id}`}><img src={process.env.REACT_APP_BACKEND_ADDRESS as string + '/' + fetchStatus.user?.picture}
			alt='profile' /></Link>
			<div className='profile-overview-content'>
				<div className='profile-overview-data'>
					<h3><Link to={`/profile/${fetchStatus.user?.id}`}>{fetchStatus.user?.displayName}</Link></h3> {/* tba an a tag redirecting to profile page */}
					<div className='profile-overview-progress'>
						<p>Level:</p>
						<progress value='50' max='100'></progress>
					</div>
					<div className='profile-overview-progress'>
						<p>Elo:</p>
						<progress
							value={
								fetchStatus.user
								? getVictoryRatio(fetchStatus.user?.victories, fetchStatus.user?.losses)
								: 50
							}
							max='100'>
						</progress>
					</div>
				</div>
				<div className='profile-overview-actions'>
					<button title='Log Out' onClick={() => RequestWrapper.get('/auth/logout')} ><img src={CloseAsset} alt='btn' /></button>
					<button title='Edit Profile' onClick={() => setModalProps(profileOptsModal)}>
						<img src={GearAsset} alt='btn' />
					</button>
					{/* <button title='HK'><img src={StarAsset} alt='btn' /></button> */}
				</div>
			</div> 
		</div>
	);
};

export default ProfileOverview;