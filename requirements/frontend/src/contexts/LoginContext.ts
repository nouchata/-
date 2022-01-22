import { createContext } from 'react';

const LoginContext = createContext<any>(['', () => {}]);

export default LoginContext;