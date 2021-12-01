import { DeepPartial } from "typeorm";
import { User } from "../entities/user.entity";

export class EditUserDTO {
    id: number;
    username: string;
    avatar: string;

    static from(dto: Partial<EditUserDTO>) {
        const user = new EditUserDTO();
        user.id = dto.id;
        user.username = dto.username;
        user.avatar = dto.avatar;
        return user;
    }

    toEntity() : DeepPartial<User> {
        const user = new User();
        this.username ? user.username = this.username : user.username = null;
        this.avatar ? user.avatar = this.avatar : user.avatar = null;
        return user;
    }
    
}
