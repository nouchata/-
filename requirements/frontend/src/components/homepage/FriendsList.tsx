import React from "react";
import LoadingContent from "../../LoadingContent";
import { FetchFriendsList } from "../../types/FetchFriendsList";
import { RequestWrapper } from "../../utils/RequestWrapper";
import UserAsset from '../../assets/homepage/user.png';
import StatusDisplay from "../utils/StatusDisplay";

interface IProps {}

interface IState {
    list: FetchFriendsList[] | undefined,
    isLoaded: boolean,
    error: boolean
}

const FriendRow = (props: FetchFriendsList) => {
    return (
        <tr key={props.id} className='friends-row'>
            <div>
                <img
                    alt="friend's avatar"
                    src={`${process.env.REACT_APP_BACKEND_ADDRESS}/${props.picture}`}
                />
            </div>
            <div>
                <h3>{props.displayName}</h3>
                <StatusDisplay status={props.status}/>
            </div>
        </tr>
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



    render() {
        if (!this.state.isLoaded) {
			return <LoadingContent widget={true} image={UserAsset} />;
        } else if (this.state.error) {
            return <p>ERROR</p>
        }

        return (
            <table>
                <tbody>
                    {
                        this.state.list?.map((friend) => {
                            return (<FriendRow {...friend} />);
                        })
                    }
                </tbody>
            </table>
        );
    }
}

export default FriendsList;
