import { useEffect } from 'react';

type ErrorProps = {errorCode: string | undefined, message: string}

const Error = (props: ErrorProps): JSX.Element => {
	return (
		<div>
			<h1>{props.errorCode}</h1>
		</div>
	);
};

export default Error;