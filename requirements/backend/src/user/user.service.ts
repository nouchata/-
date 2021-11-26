import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserDetails } from 'src/auth/utils/UserDetails';
import { Repository } from 'typeorm';
import { CreateUserDTO } from './dtos/create-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
	constructor(@InjectRepository(User) private userRepo: Repository<User>) {}
	async createUser(details: CreateUserDTO) : Promise<User>
	{
		const user = this.userRepo.create(details);
    	return this.userRepo.save(user);
	}

	async findUser(details: UserDetails) : Promise<User>
	{
		return this.userRepo.findOne(details);
	}
}
