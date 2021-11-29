import { useEffect, useState, Suspense } from 'react';
import { BrowserRouter as Router, Route, Link, Redirect, Switch } from 'react-router-dom';
import LoginContext from './LoginContext';
import Login from './Login';
import Axios from 'axios';
import './styles/App.scss'

const App = (props: any) : JSX.Element => {
  let auth_cookie = useState(false);
  let data_fetch = useState(false);

  useEffect(() => {
    (async() => {
      try {
        await new Promise((resolve) => setTimeout(() => resolve(Axios.get('http://localhost:4000/auth/status', { withCredentials: true })), 1000));
        auth_cookie[1](true);
      } catch {}
      data_fetch[1](true);
    })();
  }, []);

	return (
    <LoginContext.Provider value={auth_cookie}>
      {data_fetch[0] && <div className="App">
        <Router>
          <Route path="/login"><Login /></Route>
        </Router>
      </div>}
      {!data_fetch[0] && <p>loading ...</p>}
    </LoginContext.Provider>
  );
}

function readCookie(name: string) : string | null {
  let nameEQ = name + "=";
  let ca = document.cookie.split(';');
  for (let i=0 ;i < ca.length ; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1,c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length,c.length);
  }
  return null;
}

export default App;
