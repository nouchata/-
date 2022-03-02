import React, { useState } from "react";
import LoadingContent from "../../utils/LoadingContent";
import { FetchFriendsList } from "../../types/FetchFriendsList";
import { RequestWrapper } from "../../utils/RequestWrapper";
import UserAsset from '../../assets/homepage/user.png';
import ChatAsset from '../../assets/homepage/chat.png';
import RemoveAsset from '../../assets/chat/close.png';
import StatusDisplay from "../utils/StatusDisplay";
import '../../styles/friends_list.scss';
import '../../styles/social_field.scss';
import { Link } from "react-router-dom";

interface rowProps {
    data: FetchFriendsList,
    onClick: (name: string) => void
}

interface IProps {}

interface IState {
    list: FetchFriendsList[] | undefined,
    isLoaded: boolean,
    error: boolean
}

const ConfirmRemoveModal = (name: string) => {
    return (
        <div className="friend-remove-modal">
            <h1>{`You're about to remove ${name} from your friendlist`}</h1>
            <div className="remove-modal-buttons">
                <button>Yes</button>
                <button>No</button>
            </div>
        </div>
    );
}

const FriendRow = (props: rowProps) => {

    const [buttonVisible, setButtonVisible] = useState(false);

    return (
        <li
            key={props.data.id}
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

class FriendsList extends React.Component<IProps, IState> {

    constructor(props: IProps) {
        super(props);

        this.state = {
            list: [],
            isLoaded: false,
            error: false
        };
    }

    async componentDidMount() {
        const data = await RequestWrapper.get<FetchFriendsList[]>('/user/friends/list', {}, (e) => {
            console.log(e);
            this.setState({ error: true });
        });
        this.setState({ list: data, isLoaded: true });
    }

    async removeFriend(name: string) {
        const 
    }

    render() {
        if (!this.state.isLoaded) {
			return <LoadingContent widget={true} image={UserAsset} />;
        } else if (this.state.error) {
            return <p>ERROR</p>
        }

        return (
            <ul className="friendslist-container">
            {
                this.state.list?.map((friend) => {
                    return (<FriendRow onClick={this.removeFriend} data={friend} />);
                })
            }
            </ul>
        );
    }
}

export default FriendsList;
