import React, { useState } from "react";
import { FetchUserData } from "../../types/FetchUserData";
import { RequestWrapper } from "../../utils/RequestWrapper";

interface IProps {
    data: FetchUserData,
    changeState: () => void
}

const UserEdition = (props: IProps) => {

    const [username, setUsername] = useState<string>(props.data.general.name);
    const [selectedFile, setSelectedFile] = useState<File>();
    const [isFilePicked, setIsFilePicked] = useState<boolean>(false);
    const [avatarUrl, setAvatarUrl] = useState<string>('');

    const handleAvatarChange = (event: React.FormEvent<HTMLInputElement>) => {
        if (event.currentTarget.files) {
            setSelectedFile(event.currentTarget.files[0]);
            setIsFilePicked(true);
            setAvatarUrl(URL.createObjectURL(event.currentTarget.files[0]));
        }
    };

    const handleUsernameChange = (event: React.FormEvent<HTMLInputElement>) => {
        setUsername(event.currentTarget.value);
    };

    const handleSubmit = async () => {
        let formData = new FormData();
        formData.append('username', username);

        if (isFilePicked) {
            formData.append('picture', selectedFile as File);
        }

		await RequestWrapper.post('/user/edit', formData, (e) => {
            if (e.response) {
                alert(e.response.data.message);
            } else {
                alert('an error occured, going back to profile page.');
                props.changeState();
            }
		});
		props.changeState();
    };

    return (
        <div className='edition-page'>
            <h1>Edit your profile</h1>

            <div className='edition-block'>
                <img
                    src={
                        avatarUrl ?
                        avatarUrl :
                        `${process.env.REACT_APP_BACKEND_ADDRESS}/${props.data.general.picture}`
                    }
                    alt='avatar of the user'
                />
    
                <div className='forms'>
                    <input
                        type='text'
                        className='name-input'
                        value={username}
                        onChange={handleUsernameChange}
                        placeholder='your new username'
                    />
                    <br/>
                    <input type='file' id='file' className='file-input' name='picture' accept='image/*' onChange={handleAvatarChange}/>
                    <label htmlFor='file'>Change your picture</label>
                    <br/>
                    <button className='save' onClick={handleSubmit}>
                        Save your changes
                    </button>
                    <button className='cancel' onClick={props.changeState}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}

export default UserEdition;
