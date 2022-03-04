import { faBan, faUser, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useContext, useState } from 'react';
import { Link, Redirect, useHistory } from 'react-router-dom';
import ModalContext from '../../../contexts/ModalContext';
import { ChannelDto } from '../types/user-channels.dto';
import Button from './Button';

const Members = ({
	userId,
	channel,
}: {
	userId: number;
	channel: ChannelDto;
}) => {
	const { setModalProps } = useContext(ModalContext);

	return (
		<div className="members">
			{channel.users.map((user) => {
				return (
					<div className="member" key={user.id}>
						<div className="user-infos">
							<div className="member-image">
								<img
									src={
										(process.env
											.REACT_APP_BACKEND_ADDRESS as string) +
										'/' +
										user.picture
									}
									alt=""
								/>
							</div>
							<div>
								<div className="member-name">
									{user.displayName}
								</div>
								<div className="member-status">
									{user.status}
								</div>
							</div>
						</div>

						<div className="buttons">
							<Button
								onClick={() => {
									setModalProps(undefined);
								}}
							>
								<FontAwesomeIcon
									icon={faUser}
									className="icon"
								/>
								See profile
							</Button>
							<Button
								onClick={() => {}}
								className="friend-button"
							>
								<FontAwesomeIcon
									icon={faUserPlus}
									className="icon"
								/>
								Add to friends
							</Button>
							<Button onClick={() => {}} className="block-button">
								<FontAwesomeIcon
									icon={faBan}
									className="icon"
								/>
								Block
							</Button>
						</div>
					</div>
				);
			})}
		</div>
	);
};

export default Members;
