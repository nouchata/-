// import { BrowserRouter as Link, Route, Redirect } from 'react-router-dom';
import ProfileOverview from '../../components/homepage/HProfileOverview';
import RankingTable from '../../components/homepage/RankingTable';

import '../../styles/homepage.scss';
import '../../styles/profile_overview.scss';
import { useLogin } from '../../Providers/LoginProvider';

const Homepage = () : JSX.Element => {
	const { loginStatus } = useLogin();

	return (
		<>
			<div className='homepage-header'>
				<h1>Welcome back, <br /><span>{loginStatus.user?.displayName}</span> !</h1>
				<ProfileOverview fetchStatus={loginStatus} />
			</div>
			<div className='homepage-widgets'>
					<div>
						<h2>Rankings</h2>
						<RankingTable userId={loginStatus.user?.id}/>
					</div>
					
			</div>
		</>
	);
}

export default Homepage;
