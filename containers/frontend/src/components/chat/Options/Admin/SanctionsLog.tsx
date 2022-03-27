import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { PunishmentDto } from '../../types/punishment.dto';

const SanctionLog = ({
	punishements,
	back,
}: {
	punishements: PunishmentDto[];
	back: () => void;
}) => {
	return (
		<div className="sanction-log-modal">
			<FontAwesomeIcon
				icon={faChevronLeft}
				className="button-icon"
				onClick={back}
			/>
			<h1>Sanctions Log</h1>
			<div className="punishments">
				{punishements.map((punishment, index) => {
					return (
						<div className="punishment" key={index}>
							<div className="info-group">
								<label>Type:</label>
								<p className={`info tag ${punishment.type}`}>
									{punishment.type}
								</p>
							</div>
							<div className="info-group">
								<label>Display Name:</label>
								<p className="info">
									{punishment.user.displayName}
								</p>
							</div>
							<div className="info-group">
								<label>Admin:</label>
								<p className="info">{punishment.admin}</p>
							</div>
							<div className="info-group">
								<label>Reason:</label>
								<p className="info">
									{punishment.reason || 'No reason provided'}
								</p>
							</div>
							<div className="info-group">
								<label>Date:</label>
								<p className="info">
									{punishment.createdAt.toLocaleString(
										'fr-FR'
									)}
								</p>
							</div>
							<div className="info-group">
								<label>Expiration:</label>
								<p className="info">
									{punishment.expiration?.toLocaleString(
										'fr-FR'
									) || 'No expiration'}
								</p>
							</div>
							<div className="info-group">
								<label>Status:</label>
								{!punishment.expiration ||
								punishment.expiration > new Date() ? (
									<p className='info tag'>Active</p>
								) : (
									<p className='info tag inactive'>Inactive</p>
								)}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default SanctionLog;
