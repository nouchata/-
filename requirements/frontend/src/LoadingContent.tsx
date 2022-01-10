import './styles/loading_content.scss';

const LoadingContent = (props: any) => {
	return (
		<div className={'loading-content' + (props.widget ? ' lc-widget' : '')}>
			{props.image ?
			<img src={props.image} alt="loading" /> :
			<img src="data:image/png;base64,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"
			alt="loading" />}
		</div>
	);
};

export default LoadingContent;