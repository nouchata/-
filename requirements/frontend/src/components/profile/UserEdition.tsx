import axios from "axios";
import React, { useState } from "react";
import { FetchUserData } from "../../types/FetchUserData";

interface IProps {
    data: FetchUserData,
    changeState: () => void
}

const UserEdition = (props: IProps) => {

    const [username, setUsername] = useState<string>(props.data.general.name);
    const [selectedFile, setSelectedFile] = useState<File>();
    const [isFilePicked, setIsFilePicked] = useState<boolean>(false);

    const handleAvatarChange = (event: React.FormEvent<HTMLInputElement>) => {
        if (event.currentTarget.files) {
            setSelectedFile(event.currentTarget.files[0]);
            setIsFilePicked(true);
        }
    };

    const handleUsernameChange = (event: React.FormEvent<HTMLInputElement>) => {
        setUsername(event.currentTarget.value);
    };

    const handleSubmit = () => {
        if (isFilePicked) {
            let formData = new FormData();
            formData.append('picture', selectedFile as File);
            formData.append('username', username);
    
            axios.post(
                process.env.REACT_APP_BACKEND_ADDRESS as string + `/user/edit`,
                formData,
                { withCredentials: true }
            )
            .then(() => {
                props.changeState();
            })
            .catch(() => {
                alert('an error occured, going back to profile page.');
                props.changeState();
            });
        }
    };

    return (
        <div className='edition'>
            <h1>Edit your information</h1>

            <label>
                username:
                <input type='text' value={username} onChange={handleUsernameChange}/>
            </label>
            <br />
            <label>
                avatar:
                <input type='file' name='picture' accept='image/*' onChange={handleAvatarChange}/>
            </label>
            <br />
            <button onClick={handleSubmit}>
                Save your changes
            </button>

        </div>
    );
}

export default UserEdition;