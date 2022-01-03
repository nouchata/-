import { FetchUserData } from "../../types/FetchUserData";

interface IProps {
    data: FetchUserData
}

const HistoryTable = (props: IProps) => {

    const renderHeader = () => {
        return (
            <tr>
                <th key='head-winner'>WINNER</th>
                <th key='head-score'>SCORE</th>
                <th key='head-loser'>LOSER</th>
                <th key='head-duration'>DURATION</th>
            </tr>
        );
    }

    const renderData = () => {
        return props.data.history.map((match) => {
            return (
                <tr key={match.id} className={
                    match.winner === props.data.general.name 
                    ? 'win'
                    : 'lose'
                }>
                    <td>{match.winner}</td>
                    <td>{`${match.score[0]} - ${match.score[1]}`}</td>
                    <td>{match.loser}</td>
                    <td>{match.duration}</td>
                </tr>
            );
        });
    }

    if (props.data.history.length === 0) {
        return <div>This user has not played any match yet.</div>
    }

    return (
        <>
            <table className='matches'>
                <thead>
                    {renderHeader()}
                </thead>
                <tbody>
                    {renderData()}
                </tbody>
            </table>
        </>
    );
}

export default HistoryTable;
