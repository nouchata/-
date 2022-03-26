import { createContext, ReactNode, useContext, useState } from 'react';
import { GenericModalProps } from '../components/utils/GenericModal';

interface IModalProvider {
	modalProps?: GenericModalProps;
	setModalProps: (props: GenericModalProps | undefined) => void;
}

const ModalContext = createContext<IModalProvider | undefined>(undefined);

const useModal = () => {
	const context = useContext(ModalContext);
	if (context === undefined) {
		throw new Error('useModal must be used within a ModalProvider');
	}
	return context;
};

const ModalProvider = ({ children }: { children: ReactNode }) => {
	const [modalProps, setModalProps] = useState<GenericModalProps | undefined>({
		show: false,
		content: <div />,
	});

	return (
		<ModalContext.Provider value={{ modalProps, setModalProps }}>
			{children}
		</ModalContext.Provider>
	);
};

export { ModalProvider, useModal };