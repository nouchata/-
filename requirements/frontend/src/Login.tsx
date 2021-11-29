import { useState, useEffect, useContext, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import LoginContext from './LoginContext';
import Axios from 'axios';

const Login = () =>
{
	let [ dataSet, setDataSet ] = useState({ h1: '', p: '', img: '' });
	let queryCode = useQuery().get('code');
	let [ cookie, setCookie ] = useContext(LoginContext);
	let res : string | null = 'x';

	useEffect(() => {
		if (cookie === false && !queryCode) {
			window.open('http://localhost:4000/auth/login', 'Login 42', 'scrollbars=no,resizable=no,' +
			'status=no,location=no,toolbar=no,menubar=no,width=500,height=600');
			setDataSet({ 
				h1: 'Use the prompt to Log In',
				p: 'Please follow the instructions in the popup. If the popup hasn\'t showed, click here.',
				img: 'loading.png'
			});
			(async() => {
				let flag = true;
				while (flag) {
					try {
						await new Promise((resolve) => setTimeout(() => resolve(Axios.get('http://localhost:4000/auth/status', { withCredentials: true })), 1000));
						flag = false;
					} catch {}
				}
				setCookie(true);
				setDataSet({ h1: 'got it !', p: dataSet.p, img: dataSet.img });
			})();
		} else if (cookie === false && queryCode) {
			setDataSet({ 
				h1: 'Logging In',
				p: 'Please wait a moment, this window will automatically close.',
				img: 'loading.png'
			});
			(async() => {
				try {
				await Axios.get(`http://localhost:4000/auth/redirect`, {withCredentials: true, params: {code: queryCode}});
				} catch {}
				setDataSet({ 
					h1: 'You are logged in !',
					p: 'Please wait a moment, you will redirect to your last location.',
					img: 'done.png'
				});
				setCookie(true)
			})();
		} else {
			setDataSet({ 
				h1: 'You are logged in !',
				p: 'Please wait a moment, you will redirect to your last location.',
				img: 'done.png'
			});
			(async() => {
				setTimeout(() => window.close(), 1000); 
			})();
		}
	}, []);

	return (
		<div>
			<h1>{dataSet.h1}</h1>
			{dataSet.p.length && <p>{dataSet.p}</p>}
			<img src="#" />
		</div>
	);
}

function useQuery() {
	const { search } = useLocation();
	return useMemo(() => new URLSearchParams(search), [search]);
}

function fetchLogin() : void {

}

function readCookie(name: string) : string | null {
    let nameEQ = name + "=";
    let ca = document.cookie.split(';');
    for (let i=0 ; i < ca.length ; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}

export default Login;
