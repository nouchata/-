export type UserStatus = 'online' | 'offline' | 'ingame';

interface StatusProps {
    status: UserStatus;
}

const StatusDisplay = (props: StatusProps) => {

    const statusStyle = {
        color: 'green'
    };

    if (props.status === 'offline') {
        statusStyle.color = 'red';
    } else if (props.status === 'ingame') {
        statusStyle.color = 'orange';
    }

    return (
        <p style={statusStyle}>◉ {props.status}</p>
    );
}

export default StatusDisplay;
