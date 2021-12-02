import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EditUserDTO } from './dto/edit-user.dto';
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
}
