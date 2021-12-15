import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Link, Switch } from 'react-router-dom';
import { FetchStatusData } from './types/FetchStatusData';
import LoginContext from './LoginContext';
import Login from './Login';
import LoadingContent from './LoadingContent';
import Axios from 'axios';
import './styles/global.scss';
import Profile from './components/profile/Profile';

const App = (props: any) : JSX.Element => {
  let auth_cookie = useState(false);
  let data_fetch = useState(false);

  useEffect(() => {
    (async() => {
      try {
        let res : FetchStatusData = await new Promise((resolve) => 
						setTimeout(() => 
						resolve(Axios.get(process.env.REACT_APP_BACKEND_ADDRESS as string + 
							'/auth/status', 
							{ withCredentials: true })), 1000)
						);
        auth_cookie[1](res.data.loggedIn);
      } catch {}
      data_fetch[1](true);
    })();
  }, []); // eslint-disable-line

	return (
    <LoginContext.Provider value={auth_cookie}>
      {data_fetch[0] && <div className="App">
        <Router>
          <Switch>
            <Route path="/profile/:id"><Profile /></Route>
            <Route path="/login"><Login /></Route>
            <Route path="/">
              <Link to="/login">Login</Link>
            </Route>
          </Switch>
        </Router>
      </div>}
      {!data_fetch[0] && <LoadingContent />}
    </LoginContext.Provider>
  );
}

export default App;
