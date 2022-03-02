import '../../styles/generic_modal.scss';
import CloseAsset from '../../assets/profile/close.png';
import { useContext } from 'react';
import ModalContext from '../../contexts/ModalContext';

type GenericModalProps = {
	show: boolean;
	content: JSX.Element;
	cantBeClosed?: boolean;
	height?: string;
	width?: string;
	maxHeight?: string;
	maxWidth?: string;
};

const GenericModal = (props: GenericModalProps): JSX.Element | null => {
	const { setModalProps } = useContext(ModalContext);

	if (props.show)
		return (
			<div className="bg-modal">
				<div
					className="modal"
					style={{
						height: props.height,
						flex: `0 1 ${props.width}`,
						maxHeight: props.maxHeight,
						maxWidth: props.maxWidth,
					}}
				>
					{!props.cantBeClosed && (
						<button
							onClick={() =>
								setModalProps({
									show: false,
									content: <div />,
									cantBeClosed: undefined,
									height: undefined,
									width: undefined,
								})
							}
						>
							<img src={CloseAsset} alt="close modal" />
						</button>
					)}
					{props.content}
				</div>
			</div>
		);
	else return null;
};

export default GenericModal;
export type { GenericModalProps };
