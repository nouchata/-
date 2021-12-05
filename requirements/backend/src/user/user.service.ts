import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EditUserDTO } from './dto/edit-user.dto';
import { FindUserDTO, HistoryInfo } from './dto/find-user.dto';
import { Like, Repository, UpdateResult } from 'typeorm';
import { User } from './entities/user.entity';
import { UserInterface } from './interface/UserInterface';

@Injectable()
export class UserService {
	constructor(@InjectRepository(User) private userRepo: Repository<User>) {}
	
	async createUser(details: UserInterface) : Promise<User>
	{
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

	async editUser(dto: EditUserDTO) : Promise<UpdateResult>
	{
		const user = await this.findUserById(dto.id);
		return await this.userRepo.update(user, dto.toEntity());
	}

	async getRank(user: User) : Promise<number> {

		const usersArray: User[] = await this.userRepo.find();

		usersArray.sort( (a: User, b: User) : number => {
			return (b.elo - a.elo);
		})

		return usersArray.findIndex( (curr) => {
			return (curr.id === user.id);
		}) + 1;
	}

	async createUserDTO(entity: User) : Promise<FindUserDTO>
	{
		const dto = new FindUserDTO();
        
        dto.general.name = entity.displayName;
        dto.general.picture = entity.picture;
        dto.general.role = entity.role;
        dto.general.creation = entity.createdAt;
        dto.general.status = entity.status;

        dto.ranking.vdRatio = entity.vdRatio;
        dto.ranking.elo = entity.elo;
        dto.ranking.rank = await this.getRank(entity);

        entity.history.forEach( (match) => {
            const matchInfo = new HistoryInfo();

            matchInfo.winner = match.players[0];
            matchInfo.loser = match.players[1];
            matchInfo.score = match.score;
            matchInfo.duration = match.duration;
            dto.history.push(matchInfo);
        });

        return dto;
	}
}
