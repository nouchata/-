import './Button.scss';

const Button = ({
	children,
	onClick,
	className,
}: {
	children?: React.ReactNode;
	onClick: () => void;
	className?: string;
}) => {
	return (
		<div
			className={`button-option ${className || ''}`}
			onClick={() => {
				onClick();
			}}
		>
			{children}
		</div>
	);
};

export default Button;
