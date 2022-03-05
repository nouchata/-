import { useState } from "react";

interface IProps {
    cb: (name: string) => void
}

const AddFriendModal = (props: IProps) => {

    const [username, setUsername] = useState('');

    return (
        <div className='friend-add-modal'>
            <h1>Who do you want to add as your friend ?</h1>
            <input
                className='add-modal-input'
                type='text'
                value={username}
                onChange={(event: React.FormEvent<HTMLInputElement>) => setUsername(event.currentTarget.value)}
                placeholder="your friend's username"
            />
            <button
                className='add-modal-submit'
                onClick={() => props.cb(username)}
            >
                Submit
            </button>
        </div>
    );
}

export default AddFriendModal;