import React, { useEffect, useRef, useState } from 'react';
import { FetchLadderData } from '../../types/FetchLadderData';
import { RequestWrapper } from '../../utils/RequestWrapper';
import '../../styles/ranking_table.scss';
import { useNavigate } from 'react-router-dom';
// import { RouteComponentProps, withRouter } from 'react-router';

interface IProps {
    userId: number | undefined;
}

interface IState {
    data?: FetchLadderData[] | undefined,
    isLoaded?: boolean,
    error?: boolean
}

const RankingTable = (props: IProps) => {
    const scrollUserRef = useRef<HTMLTableRowElement>(null);
    const scrollTopRef = useRef<HTMLTableRowElement>(null);
    const [ rankingData, setRankingData ] = useState<IState>({});
    const navigate = useNavigate();

    useEffect(() => {
        (async() => {
            const ladder = await RequestWrapper.get<FetchLadderData[]>(
                '/user/ladder',
                {},
                (e) => {
                    console.log(e.response);
                    setRankingData({...rankingData, error: true });
                }
            );
            setRankingData({...rankingData, data: ladder, isLoaded: true });
        })();
    }, []); // eslint-disable-line

    const executeScrollTop = (e: any) => {
        if (scrollTopRef.current)
            scrollTopRef.current.scrollIntoView();
    }

    const executeScrollUser = (e: any) => {
        if (scrollUserRef.current)
            scrollUserRef.current.scrollIntoView();
    }

    const renderBodyData = () => {
        const ladder = rankingData.data as FetchLadderData[];

        return ladder.map((user, rank) => {
            let myRef: React.RefObject<HTMLTableRowElement> | null = null;
            let myClassName: string | undefined;

            if (rank === 0) {
                myRef = scrollTopRef;
            } else if (user.id === props.userId) {
                myRef = scrollUserRef;
                myClassName = 'user-row';
            }

            return (
                <tr key={rank} className={myClassName} ref={myRef}>
                    <td className='rank-column'>{rank + 1}</td>
                    <td
                        onClick={() => navigate(`/profile/${user.id}`)}
                        className='profile-link'
                    >
                        {user.displayName}
                    </td>
                    <td>{user.elo}</td>
                </tr>
            );
        });
    }

    if (!rankingData.isLoaded) {
        return (<p>loading... please wait...</p>);
    } else if (rankingData.error) {
        return (<p>Failure while trying to fetch ladder information.</p>);
    } else {
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
                            {renderBodyData()}
                        </tbody>
                    </table>
                </div>
                <div className='row-buttons'>
                    <button className='button-top' onClick={executeScrollTop}>go to the top</button>
                    <button className='button-rank' onClick={executeScrollUser}>show my rank</button>
                </div>
            </>
        );
    }
};

export default RankingTable;
