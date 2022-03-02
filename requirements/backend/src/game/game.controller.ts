import { Controller } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/user/entities/user.entity";
import { Repository } from "typeorm";

@Controller('game')
export class GameController {
	constructor(
		@InjectRepository(User) private userRepo: Repository<User>
	) {}
}