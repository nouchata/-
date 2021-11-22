import React, { useState } from 'react';
import ButtonTest from './Button';
import './styles/App.scss'

function App() {
	const [data, setData] = useState<string>("ft_transcendence");

	return (
    <div className="App">
      {data}
	  <ButtonTest fun={setData} />
    </div>
  );
}

export default App;
