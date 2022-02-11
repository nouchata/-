import React from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { FetchUserData } from "../../types/FetchUserData";
import UserDetails from "./UserDetails";
import UserEdition from "./UserEdition";
import { RequestWrapper } from "../../utils/RequestWrapper";
import '../../styles/profile.scss';

interface ProfileRouterProps {
    id: string;
}

interface IProps extends RouteComponentProps<ProfileRouterProps> {
    // in case we need to add more props later
}

interface IState {
    user: FetchUserData | undefined;
    edition: boolean;
    isLoaded: boolean;
    error: {
        info: string,
        message: string
    } | null;
}

class Profile extends React.Component<IProps, IState> {

    constructor(props: IProps) {
        super(props);

        this.state = {
            user: undefined,
            edition: false,
            isLoaded: false,
            error: null
        }
    }

    loadUserInfo = async () => {
		const fetchUserData = await RequestWrapper.get<FetchUserData>(
			`/user/${this.props.match.params.id}`,
			{},
			(e) => {
				if (e.response) {
					this.setState({ error: {
						info: e.response.data.error,
						message: e.response.data.message
					}});
				}
				else {
					this.setState({ error: {
						info: '',
						message: 'Unexpected Error !'
					}});
				}
			}
		);
		this.setState({ user: fetchUserData, isLoaded: true });	
    };

    componentDidMount() {
        this.loadUserInfo();
    }
    
    handleClick = () => {
        if (this.state.edition) {
            this.loadUserInfo();
        }
        this.setState({ edition: !this.state.edition });
    }

    render() {

        if (this.state.error) {
            return (
                <div className='profile'>
                    <h1>Sorry ! :(</h1>
                    <p>
                        {
                            this.state.error.info
                            ? this.state.error.info + ': ' + this.state.error.message
                            : this.state.error.message
                        }
                    </p>
                </div> 
            );
        } else if (!this.state.isLoaded) {
            return (
                <h1>Loading user data...</h1>
            );
        } else {
            const user = this.state.user as FetchUserData; // user is not undefined anymore

            if (!this.state.edition) {
                return <UserDetails data={user} onClick={this.handleClick} />
            } else {
                return <UserEdition data={user} changeState={this.handleClick} />
            }
        }
    }
}

export default withRouter(Profile);
