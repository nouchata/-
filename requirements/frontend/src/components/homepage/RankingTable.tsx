import React from 'react';
import { FetchLadderData } from '../../types/FetchLadderData';
import { RequestWrapper } from '../../utils/RequestWrapper';
import '../../styles/ranking_table.scss';
import { RouteComponentProps, withRouter } from 'react-router';

interface RankingTableRouterProps {
    history: any;
}

interface IProps extends RouteComponentProps<RankingTableRouterProps> {
    userId: number | undefined;
}

interface IState {
    data: FetchLadderData[] | undefined,
    isLoaded: boolean,
    error: boolean
}

class RankingTable extends React.Component<IProps, IState> {

    scrollUserRef: React.RefObject<HTMLTableRowElement>;
    scrollTopRef: React.RefObject<HTMLTableRowElement>;

    constructor(props: IProps) {
        super(props);

        this.scrollTopRef = React.createRef();
        this.scrollUserRef = React.createRef();

        this.state = {
            data: [],
            isLoaded: false,
            error: false
        }
    }

    async componentDidMount() {
        const ladder = await RequestWrapper.get<FetchLadderData[]>(
			'/user/ladder',
			{},
			(e) => {
                console.log(e.response);
				this.setState({ error: true });
			}
		);
		this.setState({ data: ladder, isLoaded: true });
    }

    executeScrollTop = (e: any) => {
        if (this.scrollTopRef.current) {
            this.scrollTopRef.current.scrollIntoView();            
        }
    }

    executeScrollUser = (e: any) => {
        if (this.scrollUserRef.current) {
            this.scrollUserRef.current.scrollIntoView();            
        }
    }

    renderBodyData = () => {
        const ladder = this.state.data as FetchLadderData[];

        return ladder.map((user, rank) => {
            let myRef: React.RefObject<HTMLTableRowElement> | null = null;
            let myClassName: string | undefined;

            if (rank === 0) {
                myRef = this.scrollTopRef;
            } else if (user.id === this.props.userId) {
                myRef = this.scrollUserRef;
                myClassName = 'user-row';
            }

            return (
                <tr key={rank} className={myClassName} ref={myRef}>
                    <td className='rank-column'>{rank + 1}</td>
                    <td
                        onClick={() => {
                            this.props.history.push(`/profile/${user.id}`); }}
                        className='profile-link'
                    >
                        {user.displayName}
                    </td>
                    <td>{user.elo}</td>
                </tr>
            );
        });
    }

    render() {
        if (!this.state.isLoaded) {
            return (<p>loading... please wait...</p>);
        } else if (this.state.error) {
            return (<p>Failure while trying to fetch ladder information.</p>);
        }

        return (
            <>
                <div className='table-container'>
                    <div className='table-header'>
                        <div>rank</div>
                        <div>username</div>
                        <div>elo</div>
                    </div>
                    <table className='rankings'>
                        <tbody>
                            {this.renderBodyData()}
                        </tbody>
                    </table>
                </div>
                <div className='row-buttons'>
                    <button className='button-top' onClick={this.executeScrollTop}>go to the top</button>
                    <button className='button-rank' onClick={this.executeScrollUser}>show my rank</button>
                </div>
            </>
        );
    }
}

export default withRouter(RankingTable);
