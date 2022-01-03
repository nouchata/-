interface IProps {
    color: string,
    bgcolor: string,
    completed: number
}

const ProgressBar = (props: IProps) => {

    const containerStyles = {
        height: '2%',
        width: '90%',
        backgroundColor: props.bgcolor,
        borderRadius: 50
    };

    const fillerStyles = {
        height: '100%',
        width: `${props.completed}%`,
        backgroundColor: props.color,
        borderRadius: 'inherit',
        textAlign: 'right' as 'right' // avoid type inference
    };

    const labelStyles = {
        padding: 5,
        color: 'white',
        fontWeight: 'bold' as 'bold' // avoid type inference
    };

    return (
        <div style={containerStyles}>
            <div style={fillerStyles}>
                <span style={labelStyles}>
                    {
                        props.completed ?
                            `${props.completed}%` :
                            '100%' // avoid showing 'NaN%'
                    }
                </span>
            </div>
        </div>
    );
}

export default ProgressBar;