import React, { useEffect, useState } from "react";
import { FetchUserData } from "../../types/FetchUserData";
import UserDetails from "./UserDetails";
import { RequestWrapper } from "../../utils/RequestWrapper";
import '../../styles/profile.scss';
import { useParams } from "react-router-dom";

interface ProfileComponentData {
    user?: FetchUserData;
    edition?: boolean;
    isLoaded?: boolean;
    error?: {
        info: string,
        message: string
    };
}

const Profile = () : JSX.Element => {
    const urlData = useParams();
    const [ profileCompData, setProfileCompData ] = useState<ProfileComponentData>();

    useEffect(() => {
        (async() => {
            const fetchUserData = await RequestWrapper.get<FetchUserData>(
                `/user/${urlData.id}`,
                {},
                (e) => setProfileCompData({...profileCompData, error: {
                        info: e.response.data.error || '',
                        message: e.response.data.message || ''
                }})
            );
            setProfileCompData({...profileCompData, user: fetchUserData, isLoaded: true});
        })();
    }, []); // eslint-disable-line

    if (profileCompData?.error) {
        return (
            <div className='profile'>
                <h1>Sorry ! :(</h1>
                <p>
                    {
                        profileCompData.error.info
                        ? profileCompData.error.info + ': ' + profileCompData.error.message
                        : profileCompData.error.message
                    }
                </p>
            </div> 
        );
    } else if (!profileCompData?.isLoaded) {
        return (
            <h1>Loading user data...</h1>
        );
    } else {
        const user = profileCompData.user as FetchUserData; // user is not undefined anymore
        return <UserDetails data={user} onClick={() => {}} />
    }
};

export default Profile;
