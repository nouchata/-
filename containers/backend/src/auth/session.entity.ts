import { ISession } from 'connect-typeorm/out';
import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity({ name: 'session' })
export class SessionEntity implements ISession {
	@Index()
	@Column('bigint')
	expiredAt: number;

	@PrimaryColumn('varchar', { length: 255 })
	id: string;

	@Column('text')
	json: string;
}
