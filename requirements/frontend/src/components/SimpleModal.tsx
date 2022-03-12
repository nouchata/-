import { GenericModalProps } from './utils/GenericModal';
import CloseAsset from '../../assets/profile/close.png';

const SimpleModal = ({
	modalOptions,
	children,
}: {
	modalOptions: GenericModalProps;
	children: React.ReactNode;
}) => {
	return (
		<div className="bg-modal">
			<div
				className="modal"
				style={{
					height: modalOptions.height,
					flex: `0 1 ${modalOptions.width}`,
					maxHeight: modalOptions.maxHeight,
					maxWidth: modalOptions.maxWidth,
				}}
			>
				<button>
					<img src={CloseAsset} alt="close modal" />
				</button>
				{children}
			</div>
		</div>
	);
};

export default SimpleModal;
