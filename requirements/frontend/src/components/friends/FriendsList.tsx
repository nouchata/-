import { useEffect, useState } from "react";
import { RequestWrapper } from "../../utils/RequestWrapper";
import { FetchFriendsList } from "../../types/FetchFriendsList";
import LoadingContent from "../../utils/LoadingContent";
import FriendRow from "./FriendRow";
import ConfirmRemoveModal from "./modal/ConfirmRemoveModal";

import UserAsset from '../../assets/homepage/user.png';

import '../../styles/friends_list.scss';
import '../../styles/social_field.scss';

interface IProps {
    friends: {
        val: FetchFriendsList[],
        set: React.Dispatch<React.SetStateAction<FetchFriendsList[]>>
    }
    setModal: any
}

const FriendsList = (props: IProps) => {

    const [isLoaded, setLoadingState] = useState<boolean>(false);
    const [hasFailed, setFailedState] = useState<boolean>(false);

    useEffect(() => {
        const fetchListData = async () => {
            const data = await RequestWrapper.get<FetchFriendsList[]>('/user/friends/list', {}, (e) => {
                setFailedState(true);
            });
            if (data) {
                props.friends.set(data);
                setLoadingState(true);
            }
        }
        fetchListData();
		// eslint-disable-next-line
    }, []);

    const RemoveFriend = (name: string) => {
        const userConfirm = (confirmed: boolean) => {
            if (confirmed) {
                RequestWrapper.delete(`/user/friends/delete/${name}`, (e) => {
                    console.error(e);
                }).then(() => {
                    props.friends.set(props.friends.val.filter(friend => friend.displayName !== name));
                });
            }
            props.setModal({ show: false })
        }
    
        props.setModal({
            show: true,
            content: (
                <ConfirmRemoveModal name={name} cb={userConfirm}/>
            ),
            width: '40%',
            maxWidth: '500px'
        });
    }

    if (hasFailed) {
        return <p className='friendslist-message'>Sorry, we couldn't retrieve your friendslist :(</p>
    } else if (!isLoaded) {
		return <LoadingContent widget={true} image={UserAsset} />;
    } else if (props.friends.val.length === 0) {
        return <p className='friendslist-message'>Sorry, it seems that you currently have no friends :(</p>
    }

    return (
        <ul className="friendslist-container">
        {
            props.friends.val.map((friend) => {
                return (<FriendRow key={friend.id} onClick={RemoveFriend} data={friend} />);
            })
        }
        </ul>
    );
}

export default FriendsList;
