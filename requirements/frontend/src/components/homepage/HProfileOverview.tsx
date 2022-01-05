
import { FetchStatusData } from '../../types/FetchStatusData';
import { BrowserRouter as Router, Link } from 'react-router-dom';

import CloseAsset from '../../assets/profile/close.png';
import GearAsset from '../../assets/profile/gear.png';
import StarAsset from '../../assets/profile/star.png';

//import '../../styles/profile_overview.scss';

const ProfileOverview = (fetchStatus: FetchStatusData) : JSX.Element => {
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
						<p>VS ratio:</p>
						<progress value='50' max='100'></progress>
					</div>
				</div>
				<div className='profile-overview-actions'>
					<button title='Log Out'><img src={CloseAsset} alt='btn' /></button>
					<button title='Edit Profile'><img src={GearAsset} alt='btn' /></button>
					<button title='HK'><img src={StarAsset} alt='btn' /></button>
				</div>
			</div> 
		</div>
	);
};

export default ProfileOverview;