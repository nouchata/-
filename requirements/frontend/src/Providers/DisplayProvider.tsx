import { createContext, ReactNode, useContext, useState } from 'react';

interface DisplayData {
	/* also hides chat button where viewport in mobile width */
	hideSidebar?: boolean;
	/* hides play button & message button */
	hideButtons?: boolean;
	/* remove margin & padding for the main container */
	hideMainContainerStyle?: boolean;
}

interface IDisplayContext {
	displayData: DisplayData;
	setDisplayData: (data: DisplayData) => void;
}

const DisplayContext = createContext<IDisplayContext | undefined>(undefined);

const useDisplay = () => {
	const context = useContext(DisplayContext);
	if (context === undefined) {
		throw new Error('useDisplay must be used within a DisplayProvider');
	}
	return context;
};

const DisplayProvider = ({ children }: { children: ReactNode }) => {
	const [displayData, setDisplayData] = useState<DisplayData>({});
	return (
		<DisplayContext.Provider value={{ displayData , setDisplayData }}>
			{children}
		</DisplayContext.Provider>
	);
};

export { DisplayProvider, useDisplay };
