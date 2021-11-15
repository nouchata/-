import React, { useState } from 'react';
import ButtonTest from './Button';
import './styles/App.scss'

function App() {
	const [data, setData] = useState<string>("ft_transcendence");

	function fun(odata:string) {
		setData(odata);
	}

	return (
    <div className="App">
      {data}
	  <ButtonTest fun={fun} />
    </div>
  );
}

export default App;
