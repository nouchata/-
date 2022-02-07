// import { BrowserRouter as Link, Route, Redirect } from 'react-router-dom';
import { useContext } from 'react';
import HProfileOverview from './components/homepage/HProfileOverview';
import LoginContext from './contexts/LoginContext';
import { FetchStatusData } from './types/FetchStatusData';
import RankingTable from './components/homepage/RankingTable';

import './styles/homepage.scss';
import './styles/profile_overview.scss';

const Homepage = () : JSX.Element => {
	const userCtx : { fetchStatus: FetchStatusData } = useContext(LoginContext);

	return (
		<div>
			<div className='homepage-header'>
				<h1>Welcome back, <br /><span>{userCtx.fetchStatus.user?.displayName}</span> !</h1>
				<HProfileOverview {...userCtx.fetchStatus} />
			</div>
			<div className='homepage-widgets'>
					<div>
						<h2>Rankings</h2>
						<RankingTable userId={userCtx.fetchStatus.user?.id}/>
					</div>
					
			</div>
		</div>
	);
}

export default Homepage;