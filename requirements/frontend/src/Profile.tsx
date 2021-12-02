import { useState } from "react";

const Profile = () => {

    /*const [editionMode, toggleEdition] = useState(false);


    if (!editionMode) {

    } else {

    }*/

    return (
        <div className='profile'>
            <div className='general'>
                <h1>General</h1>
                <img src=''/>
                <h2>Username</h2>
                <h3>Role</h3>
                <h3>Creation</h3>
                <h3>Status</h3>
            </div>

            <div className='ranking'>
                <h1>Ranking</h1>
                <p> V/D elo rank </p>
            </div>

            <div className='history'>
                <h1>History</h1>
                <table>
                    <thead>
                        <tr>Winner</tr>
                        <tr>Score</tr>
                        <tr>Loser</tr>
                        <tr>Duration</tr>
                    </thead>
                    <tbody>
                        <tr>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Profile;