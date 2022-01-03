import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EditUserDTO } from './dto/edit-user.dto';
import { FindUserDTO } from './dto/find-user.dto';
import { Like, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserInterface } from './interface/UserInterface';
import { MatchHistoryDTO } from './dto/match-history.dto';
import download from './utils/download';

@Injectable()
export class UserService {
	constructor(@InjectRepository(User) private userRepo: Repository<User>) {}
	
	async createUser(details: UserInterface) : Promise<User>
	{
		// download picture from 42 servers
		if (details.picture) {
			const path = `public/${details.login}.jpg`;
			const res = await download(details.picture, path);

			if (res) { // download successful
				details.picture = `${details.login}.jpg`;
			} else { // download failed, use default picture instead
				details.picture = null;
			}
		}

		const user = this.userRepo.create(details);
    	return this.userRepo.save(user);
	}

	async findUserByLogin(login: string) : Promise<User>
	{
		return this.userRepo.findOne({login});
	}

	async findUsersByLogin(loginFragment: string) : Promise<User[]>
	{
		return await this.userRepo.find({
			login: Like(`%${loginFragment}%`)
		});
	}

	async findUserById(id: number) : Promise<User>
	{
		const userDB = await this.userRepo.findOne({ id });
		if (!userDB)
			throw new NotFoundException(`User ${id} does not exist.`);
		return userDB;
	}

	async editUser(dto: EditUserDTO) : Promise<User>
	{
		const user = await this.findUserById(dto.id);

		if (!dto.picture) {
			dto.picture = user.picture;
		}
		return await this.userRepo.save(dto.toEntity());
	}

	async getRank(user: User) : Promise<number> {

		const usersArray: User[] = await this.userRepo.find({
			order: { elo: "DESC" }
		});

		return usersArray.findIndex( (curr) => {
			return (curr.id === user.id);
		}) + 1;
	}

	async createUserDTO(entity: User) : Promise<FindUserDTO>
	{
		const dto = new FindUserDTO();
        
        dto.general.name = entity.displayName;
        dto.general.picture = entity.picture ? entity.picture : 'default.jpg';
        dto.general.role = entity.role;
        dto.general.creation = entity.createdAt;
        dto.general.status = entity.status;

        dto.ranking.vdRatio = [entity.victories, entity.losses];
        dto.ranking.elo = entity.elo;
        dto.ranking.rank = await this.getRank(entity);

		dto.history = await Promise.all(entity.history.map( async (match) => {
			const matchInfo = new MatchHistoryDTO();

			const players: User[] = await this.userRepo.findByIds([match.winnerId, match.loserId]);
			
			if (players[0].id == match.winnerId) {
				matchInfo.winner = players[0].displayName;
				matchInfo.loser = players[1].displayName;
			} else {
				matchInfo.winner = players[1].displayName;
				matchInfo.loser = players[0].displayName;			
			}

			matchInfo.id = match.id;
			matchInfo.score[0] = match.winScore;
			matchInfo.score[1] = match.loseScore;
            matchInfo.duration = match.duration;
			matchInfo.date = match.date;

			return (matchInfo);
		}));

		// sort matches by date
		dto.history.sort((a, b) => {
			if (a.date < b.date) {
				return -1;
			} else {
				return (1);
			}
		})

        return dto;
	}
}
