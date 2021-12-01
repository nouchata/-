import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserDetails } from 'src/auth/utils/UserDetails';
import { Repository, UpdateResult } from 'typeorm';
import { CreateUserDTO } from './dtos/create-user.dto';
import { EditUserDTO } from './dtos/edit-user.dto';
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

	async findUserById(id: number) : Promise<User>
	{
		const user = this.userRepo.findOne({ id });
		if (!user)
			throw new NotFoundException('This user does not exist.'); // 404
		return user;
	}

	async editUser(dto: EditUserDTO) : Promise<UpdateResult>
	{
		const user = await this.findUserById(dto.id);
		return await this.userRepo.update(user, dto.toEntity());
	}
}
