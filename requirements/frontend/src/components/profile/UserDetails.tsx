import { FetchUserData } from "../../types/FetchUserData";
import HistoryTable from "./HistoryTable";
import ProgressBar from "../utils/ProgressBar";
import editAsset from "../../assets/profile/edit-solid.svg";

interface IProps {
    data: FetchUserData,
    onClick: () => void
}

const UserDetails = (props: IProps) => {

    const formatDate = (date: Date) => {
        date = new Date(date);
        return date.toLocaleDateString();
    }

    const ratio = props.data.ranking.vdRatio[0] * 100 / (props.data.ranking.vdRatio[0] + props.data.ranking.vdRatio[1]);
    const statusStyle = { color: 'red' };

    if (props.data.general.status === 'online') {
        statusStyle.color = 'green';
    } else if (props.data.general.status === 'ingame') {
        statusStyle.color = 'orange';
    }
    
    return (
        
        <div className='profile'>
            <div className='general-info'>
                <img
                        src={`${process.env.REACT_APP_BACKEND_ADDRESS}/${props.data.general.picture}`}
                        alt='avatar of the user'
                />

                <h1>
                    {props.data.general.role} {props.data.general.name}
                    {
                    props.data.isEditable
                        ? <button
                            onClick={props.onClick}
                            className='edit-button'
                            >
                                <span className='edit-icon'>
                                    <img src={editAsset} alt='edition icon'/>
                                </span>
                                edit
                            </button>
                        : null
                    }
                </h1>
                
                <p>created on {formatDate(props.data.general.creation)}</p>
                <p style={statusStyle}>◉ {props.data.general.status}</p>
            </div>
            
            <h2>Ranking</h2>
    
            <div className='label-ratio'>
                <span className='label1'>victories</span>
                <span className='label2'>loses</span>
            </div>
            <div className='ratio'>
                <div className='victory-count'>
                    {props.data.ranking.vdRatio[0]}
                </div>
                <ProgressBar color='green' bgcolor='red' completed={ratio} />
                <div className='lose-count'>
                    {props.data.ranking.vdRatio[1]}
                </div>
            </div>

            <div className='rank-info'>
                <div>
                    elo<br />
                    {props.data.ranking.elo}
                </div>
                <div>
                    rank<br />
                    {props.data.ranking.rank}
                </div>
            </div>

            <h2>History</h2>
            <HistoryTable data={props.data} />

        </div>

    );
}

export default UserDetails;