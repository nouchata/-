interface IProps {
    name: string,
    cb: (res: boolean) => void
}

const ConfirmRemoveModal = (props: IProps) => {
    return (
        <div className="friend-remove-modal">
            <h1>{`You're about to remove ${props.name} from your friendlist, are you sure ?`}</h1>
            <div className="remove-modal-buttons">
                <button onClick={() => { props.cb(true); }}>Yes</button>
                <button onClick={() => { props.cb(false); }}>No</button>
            </div>
        </div>
    );
}

export default ConfirmRemoveModal;