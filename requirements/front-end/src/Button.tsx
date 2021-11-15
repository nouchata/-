import React from 'react';

function ButtonTest({fun}: any)
{
	return (<button onClick={() => fun("hello")}>update</button>)
}

export default ButtonTest;
