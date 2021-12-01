import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

	async findUser(login: string) : Promise<User>
	{
		return this.userRepo.findOne({login: login});
	}
}
