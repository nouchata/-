import { FetchUserData } from "../../types/FetchUserData";
import HistoryTable from "./HistoryTable";

interface IProps {
    data: FetchUserData,
    onClick: () => void
}

const UserDetails = (props: IProps) => {

    const formatDate = (date: Date) => {
        date = new Date(date);
        return date.toLocaleDateString();
    }

    return (

        <div className='profile'>
            <div className='general'>
                <h1>General</h1>
                {
                    props.data.isEditable
                        ? <button onClick={props.onClick} >
                            edit
                        </button>
                        : null
                }
                <img src=
                    {
                        props.data.general.picture.startsWith('https')
                            ? props.data.general.picture
                            : `${process.env.REACT_APP_BACKEND_ADDRESS}/${props.data.general.picture}`
                    }
                    alt='' />
                <h2>{props.data.general.name}</h2>
                <h3>{props.data.general.role}</h3>
                <h3>{formatDate(props.data.general.creation)}</h3>
                <h3>{props.data.general.status}</h3>
            </div>

            <div className='ranking'>
                <h1>Ranking</h1>
                <p>Victories {props.data.ranking.vdRatio[0]}</p>
                <p>Losses {props.data.ranking.vdRatio[1]}</p>
                <p>{props.data.ranking.elo} elo</p>
                <p>rank {props.data.ranking.rank}</p>
            </div>

            <HistoryTable data={props.data}/>

        </div>

    );
}

export default UserDetails;