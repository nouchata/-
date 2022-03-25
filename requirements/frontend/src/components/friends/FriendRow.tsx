import { useState } from "react";
import { FetchFriendsList } from "../../types/FetchFriendsList";
import StatusDisplay from "../utils/StatusDisplay";

import UserAsset from '../../assets/homepage/user.png';
import ChatAsset from '../../assets/homepage/chat.png';
import RemoveAsset from '../../assets/chat/close.png';
import { useNavigate } from "react-router-dom";
import { useModal } from "../../Providers/ModalProvider";
import { useFriendList } from "../../Providers/FriendListProvider";
import ConfirmRemoveModal from "./modal/ConfirmRemoveModal";

interface IProps {
    data: FetchFriendsList,
}

const FriendRow = (props: IProps) => {
    const [buttonVisible, setButtonVisible] = useState(false);
    const nav = useNavigate();
    const { setModalProps } = useModal();
    const friendList = useFriendList();

    const removeFriend = (friend: FetchFriendsList) => {
		const userConfirm = async (confirmed: boolean) => {
			if (confirmed) {
				friendList.removeFriend(friend.id);
			}
			setModalProps(undefined);
		};

		setModalProps({
			show: true,
			content: (
				<ConfirmRemoveModal
					name={friend.displayName}
					cb={userConfirm}
				/>
			),
			width: '40%',
			maxWidth: '500px',
		});
	};


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
                            onClick={() => { removeFriend(props.data); }}
                        />
                    </div>
                : null
            }
        </li>
    );
}

export default FriendRow;