import { FetchUserData } from "../../types/FetchUserData";

interface IProps {
    data: FetchUserData
}

const HistoryTable = (props: IProps) => {

    const renderHeader = () => {
        return (
            <>
                <th key='head-winner'>WINNER</th>
                <th key='head-score'>SCORE</th>
                <th key='head-loser'>LOSER</th>
                <th key='head-duration'>DURATION</th>
            </>
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

    return (
        <div className='history'>
            <table className='matches'>
                <thead key='thead'>
                    <tr>{renderHeader()}</tr>
                </thead>
                <tbody key='tbody'>
                    {renderData()}
                </tbody>
            </table>
        </div>
    );
}

export default HistoryTable;
