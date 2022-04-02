import reportWebVitals from './reportWebVitals';
import * as ReactDOMClient from 'react-dom/client';
import App from './App';
import { StrictMode } from 'react';

const rootElement = document.getElementById('root');

if (!rootElement) {
	throw new Error('Root element not found');
}

const root = ReactDOMClient.createRoot(rootElement);
root.render(
	<StrictMode>
		<App />
	</StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
