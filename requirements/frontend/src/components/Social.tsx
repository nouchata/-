import { useEffect } from "react";
import { useDisplay } from "../Providers/DisplayProvider";
import HSocialField from "./homepage/SocialField/HSocialField";

const Social = () : JSX.Element => {
	const displayContext = useDisplay();

	useEffect(() => {
		displayContext.setDisplayData({ hideSidebar: true, hideButtons: true, hideMainContainerStyle: true });
		

		return function cleanup() { 
			displayContext.setDisplayData({});
		};
	}, []); // eslint-disable-line

	return (
		<>
			<HSocialField standalone={true} />
		</>
	);
};

export default Social;