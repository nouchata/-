import { AxiosResponse } from "axios";
import { useEffect, useRef, useState } from "react";
import "../../styles/tfa_code_input.scss";
import { RequestWrapper } from "../../utils/RequestWrapper";


enum TCIState {
	INITIAL,
	PENDING,
	YES,
	NO
};

const inputChangeHandler = (
	e: React.KeyboardEvent<HTMLInputElement>, 
	index: number, 
	inputRefs : Array<React.RefObject<HTMLInputElement>>, 
	inputValues : Array<Array<number | ((num: number | undefined) => void) | undefined>>
) : void => {
	e.preventDefault();

	// processes only for numeric chars
	if (['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].find(num => num === e.key)) {
		if (!inputValues[index][0]) // take input only if the field is empty
			(inputValues[index][1] as ((num: number) => void))(Number(e.key));
		else
			return ;
		if (index !== 5 && inputRefs[index + 1]) // move the cursor after typing until the end
			inputRefs[index + 1].current?.focus();
	} else if (e.key === 'Backspace') {
		if (inputValues[index][0]) // remove input if it exists
			(inputValues[index][1] as ((num: undefined) => void))(undefined);
		else { // go backwards n remove the previous entry
			if (index !== 0 && inputRefs[index - 1]) {
				inputRefs[index - 1].current?.focus();
				(inputValues[index - 1][1] as ((num: undefined) => void))(undefined);
			}
		}
	}	
};

const codeFetcher = async(
	inputValues : Array<Array<number | ((num: number | undefined) => void) | undefined>>,
	inputRefs : Array<React.RefObject<HTMLInputElement>>,
	setCantInput: (val: boolean) => void,
	backResponse: (arg: TCIState) => void
) => {
	let stitchedCode : string = '';
	let returnCode : string = '201';
	for (const pair of inputValues) {
		stitchedCode += String(pair[0] as number);
	}
	await RequestWrapper.post<any>(
		'/2fa/checker',
		{ givenCode: stitchedCode },
		(error) => { returnCode = error.response.status }
	);
	for (const pair of inputValues) {
		(pair[1] as ((num: undefined) => void))(undefined);
	}
	if (returnCode === '201') {
		backResponse(TCIState.YES);
		for (const ref of inputRefs) {
			(ref.current as any).style.borderColor = 'green';
			(ref.current as any).style.boxShadow = '0px 0px 10px 0px rgba(0, 255, 0, 0.5)';
			(ref.current as any).style.backgroundColor = 'rgba(255, 255, 255, 0.6)';
		}
	} else { // a failed attempt will show red border for 0.5s and then reset
		backResponse(TCIState.NO);
		for (const ref of inputRefs) {
			(ref.current as any).style.borderColor = 'red';
			(ref.current as any).style.boxShadow = '0px 0px 10px 0px rgba(255, 0, 0, 0.5)';
		}
		setTimeout(() => {
			for (const ref of inputRefs) {
				(ref.current as any).style.borderColor = 'black';
				(ref.current as any).style.boxShadow = 'none';
			}
			setCantInput(false);
		}, 500);
	}
};

const TFACodeInput = (
	props: { backResponse: (arg: TCIState) => void }
) : JSX.Element => {
	const inputRefs : Array<React.RefObject<HTMLInputElement>> = [
		useRef<HTMLInputElement>(null),
		useRef<HTMLInputElement>(null),
		useRef<HTMLInputElement>(null),
		useRef<HTMLInputElement>(null),
		useRef<HTMLInputElement>(null),
		useRef<HTMLInputElement>(null)
	];
	const inputValues : Array<Array<number | ((num: number | undefined) => void) | undefined>> = [
		useState<number>(),
		useState<number>(),
		useState<number>(),
		useState<number>(),
		useState<number>(),
		useState<number>()
	];
	const [ cantInput, setCantInput ] = useState<boolean>(false);

	useEffect(() => {
		if (!inputValues.some((pair) => pair[0] as number === undefined) && !cantInput) {
			setCantInput(true);
			props.backResponse(TCIState.PENDING);
			if (inputRefs[0]) // move the cursor back to start
				inputRefs[0].current?.focus();
			codeFetcher(inputValues, inputRefs, setCantInput, props.backResponse);
		}
	}, [inputValues]); // eslint-disable-line
	
	return (
		<div className="tfa-code-input">
			{[0, 1, 2].map((x) : JSX.Element => <input
				key={x}
				ref={inputRefs[x]}
				value={inputValues[x][0] === undefined ? '' : inputValues[x][0] as number}
				onKeyDown={(e) => inputChangeHandler(e, x, inputRefs, inputValues)}
				type="number"
				max="1"
				disabled={cantInput}
			/>)}
			<div className="separator">-</div>
			{[3, 4, 5].map((x) : JSX.Element => <input
				key={x}
				ref={inputRefs[x]}
				value={inputValues[x][0] === undefined ? '' : inputValues[x][0] as number}
				onKeyDown={(e) => inputChangeHandler(e, x, inputRefs, inputValues)}
				type="number"
				max="1"
				disabled={cantInput}
			/>)}
		</div>
	);
};

export default TFACodeInput;
export { TCIState };