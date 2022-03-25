import { useState } from "react";
import { FetchFriendsList } from "../../types/FetchFriendsList";
import StatusDisplay from "../utils/StatusDisplay";

import UserAsset from '../../assets/homepage/user.png';
import ChatAsset from '../../assets/homepage/chat.png';
import RemoveAsset from '../../assets/chat/close.png';
import { useNavigate } from "react-router-dom";

interface IProps {
    data: FetchFriendsList,
    onClick: (name: string) => void
}

const FriendRow = (props: IProps) => {

    const [buttonVisible, setButtonVisible] = useState(false);
    const nav = useNavigate();
    
    return (
        <li
            className="friend-row"
            onMouseEnter={() => { setButtonVisible(true) }}
            onMouseLeave={() => { setButtonVisible(false) }}
        >
            <div className='friend-picture'>
                <img
                    alt="friend's avatar"
                    src={`${process.env.REACT_APP_BACKEND_ADDRESS}/${props.data.picture}`}
                />
            </div>

            <div className='friend-info'>
                <h3>{props.data.displayName}</h3>
                <StatusDisplay status={props.data.status}/>
            </div>

            {
                buttonVisible ?
                    <div className="friend-buttons">
                            <img
                                src={UserAsset}
                                alt='profile page'
                                onClick={() => {
                                    nav(`/profile/${props.data.id}`); 
                                }}
                            />
                        <img
                            src={ChatAsset}
                            alt='send a message'
                        />
                        <img
                            src={RemoveAsset}
                            alt='remove friend'
                            onClick={() => { props.onClick(props.data.displayName); }}
                        />
                    </div>
                : null
            }
        </li>
    );
}

export default FriendRow;