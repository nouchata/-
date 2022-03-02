import { ChannelDto } from '../types/user-channels.dto';

const Members = ({
	userId,
	channel,
}: {
	userId: number;
	channel: ChannelDto;
}) => {
	return (
		<div className="members">
			{channel.users.map((user) => {
				return (
					<div className="member" key={user.id}>
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
				);
			})}
		</div>
	);
};

export default Members;
