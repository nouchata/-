import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EditUserDTO } from './dto/edit-user.dto';
import { FindUserDTO } from './dto/find-user.dto';
import { Like, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserInterface } from './interface/UserInterface';
import { MatchHistoryDTO } from './dto/match-history.dto';
import { Channel } from 'src/chat/entities/channel.entity';
import { MessageDto, UserChannelsDto } from './dto/user-channels.dto';
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

			return (matchInfo);
		}));

        return dto;
	}

	async getUserChannels(user: {id: number}) : Promise<UserChannelsDto[]>
	{
		let channelDtos: UserChannelsDto[] = [];

		const channels: Channel[] = (await this.userRepo.findOne({
			where: { id: user.id },
			relations: ['channels',
			'channels.owner',
			'channels.users',
			'channels.messages',
			'channels.messages.user'
		]})).channels;

		// sort messages by date
		channels.forEach( (channel) => {
			channel.messages.sort( (a, b) => {
				return (a.createdAt > b.createdAt) ? 1 : -1;
			});
		});
		

		for (let channel of channels) {
			let messageDtos: MessageDto[] = [];
			for (let message of channel.messages) {
				let messageDto: MessageDto = {
					id: message.id,
					text: message.text,
					userId: message.user.id,
				};
				messageDtos.push(messageDto);
			}
			let channelDto: UserChannelsDto  = {
				id: channel.id,
				name: channel.name,
				owner: channel.owner,
				users: channel.users,
				messages: messageDtos
			};
			channelDtos.push(channelDto);
		}
		return channelDtos;
	}
}
