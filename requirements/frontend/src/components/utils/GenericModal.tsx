import '../../styles/generic_modal.scss';
import CloseAsset from '../../assets/profile/close.png';
import { useModal } from '../../Providers/ModalProvider';

export type GenericModalProps = {
	show: boolean;
	content: JSX.Element;
	cantBeClosed?: boolean;
	height?: string;
	width?: string;
	maxHeight?: string;
	maxWidth?: string;
};

const GenericModal = ({
	modalOptions,
}: {
	modalOptions?: GenericModalProps;
}): JSX.Element | null => {
	const { setModalProps } = useModal();

	if (modalOptions && modalOptions.show)
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
					{!modalOptions.cantBeClosed && (
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
					{modalOptions.content}
				</div>
			</div>
		);
	else return <></>;
};

export default GenericModal;
