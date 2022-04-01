import { FetchStatusData } from '../../types/FetchStatusData';
import { BrowserRouter as Router, Link } from 'react-router-dom'; // eslint-disable-line
import { getVictoryRatio } from '../profile/UserDetails';

import CloseAsset from '../../assets/profile/close.png';
import GearAsset from '../../assets/profile/gear.png';
import { GenericModalProps } from '../utils/GenericModal';
import { IStdPanelContent } from '../modals/StandardModal';
import { RequestWrapper } from '../../utils/RequestWrapper';
import { useModal } from '../../Providers/ModalProvider';
import PomGeneralPanel from '../modals/pom-components/PomGeneralPanel';
import Pom2FAPanel from '../modals/pom-components/Pom2FAPanel';
import StandardModal from '../modals/StandardModal';
import { useLogin } from '../../Providers/LoginProvider';

//import '../../styles/profile_overview.scss';

const profileOptsContent: Array<IStdPanelContent> = [
	{ name: 'General', panel: <PomGeneralPanel /> },
	{ name: '2FA', panel: <Pom2FAPanel /> },
];
const profileOptsModal: GenericModalProps = {
	show: true,
	content: <StandardModal panels={profileOptsContent} />,
	height: '80%',
	width: '80%',
};

const ProfileOverview = ({
	fetchStatus,
}: {
	fetchStatus: FetchStatusData;
}): JSX.Element => {
	const { setModalProps } = useModal();
	const { refreshStatus } = useLogin();

	return (
		<div className="profile-overview">
			<Link to={`/profile/${fetchStatus.user?.id}`}>
				<img
					src={
						(process.env.REACT_APP_BACKEND_ADDRESS as string) +
						'/' +
						fetchStatus.user?.picture
					}
					alt="profile"
				/>
			</Link>
			<div className="profile-overview-content">
				<div className="profile-overview-data">
					<h3>
						<Link to={`/profile/${fetchStatus.user?.id}`}>
							{fetchStatus.user?.displayName}
						</Link>
					</h3>{' '}
					{/* tba an a tag redirecting to profile page */}
					<div className="profile-overview-progress">
						<p>ELO:</p>
						<p>{fetchStatus.user?.elo}</p>
					</div>
					<div className="profile-overview-progress">
						<p>Winrate:</p>
						<progress
							value={
								fetchStatus.user
									? getVictoryRatio(
											fetchStatus.user?.victories,
											fetchStatus.user?.losses
									  )
									: 50
							}
							max="100"
						></progress>
					</div>
				</div>
				<div className="profile-overview-actions">
					<button
						title="Log Out"
						onClick={async () => {
							await RequestWrapper.get('/auth/logout');
							refreshStatus();
						}}
					>
						<img src={CloseAsset} alt="btn" />
					</button>
					<button
						title="Edit Profile"
						onClick={() => setModalProps(profileOptsModal)}
					>
						<img src={GearAsset} alt="btn" />
					</button>
					{/* <button title='HK'><img src={StarAsset} alt='btn' /></button> */}
				</div>
			</div>
		</div>
	);
};

export default ProfileOverview;
