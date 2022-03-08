import { useContext, useEffect } from "react";
import HideDisplayContext from "../contexts/HideDisplayContext";
import { HideDisplayData } from "../types/HideDisplayData";
import HSocialField from "./homepage/HSocialField";

const Social = () : JSX.Element => {
	const [, setHideDisplay] = useContext(HideDisplayContext) as [HideDisplayData, Function];

	useEffect(() => {
		setHideDisplay({ hideSidebar: true, hideButtons: true, hideMainContainerStyle: true } as HideDisplayData);
		

		return function cleanup() {
			setHideDisplay({});
		};
	}, []);

	return (
		<>
			<HSocialField standalone={true} />
		</>
	);
};

export default Social;