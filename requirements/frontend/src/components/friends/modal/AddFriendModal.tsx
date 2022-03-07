import { useState } from "react";

interface IProps {
    cb: (name: string) => void
    info?: string
}

const AddFriendModal = (props: IProps) => {

    const [username, setUsername] = useState('');

    return (
        <div className='friend-add-modal'>
            <h1>Who do you want to add as your friend ?</h1>
            {
                props.info ?
                    <h3 className='add-modal-error'>ERROR: {props.info}</h3> :
                    null
            }
            <div className='add-modal-container'>
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
        </div>
    );
}

export default AddFriendModal;