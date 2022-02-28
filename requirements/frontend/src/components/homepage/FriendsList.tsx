import React from "react";
import LoadingContent from "../../LoadingContent";
import { FetchFriendsList } from "../../types/FetchFriendsList";
import { RequestWrapper } from "../../utils/RequestWrapper";
import UserAsset from '../../assets/homepage/user.png';

interface IProps {}

interface IState {
    list: FetchFriendsList[] | undefined,
    isLoaded: boolean,
    error: boolean
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

    renderList() {
        return this.state.list?.map((friend) => {
            return (
                <tr>
                    <td>{friend.displayName}</td>
                    <td><img src={`${process.env.REACT_APP_BACKEND_ADDRESS}/${friend.picture}`} alt=",friend's avatar"></img></td>
                    <td>{friend.status}</td>
                </tr>
            );
        });
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
                    {this.renderList()}
                </tbody>
            </table>
        );
    }
}

export default FriendsList;
