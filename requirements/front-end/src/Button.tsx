import React from 'react';

function ButtonTest({fun}: any)
{

	function other() {
		fun("hello")
	}
	return (<button onClick={other}>update</button>)
}

export default ButtonTest;
