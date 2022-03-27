import './Button.scss';

const Button = ({
	children,
	onClick,
	className,
	disabled,
}: {
	children?: React.ReactNode;
	onClick: () => void;
	className?: string;
	disabled?: boolean;
}) => {
	return (
		<div
			className={`button-option ${className || ''}`}
			onClick={() => {
				if (!disabled) {
					onClick();
				}
			}}
		>
			{children}
		</div>
	);
};

export default Button;
