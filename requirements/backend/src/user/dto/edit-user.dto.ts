import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";
import { DeepPartial } from "typeorm";
import { User } from "../entities/user.entity";

export class EditUserDTO {

	@ApiProperty({description: 'id of the user to edit', example: '45'})
	@IsNotEmpty()
    @IsNumber()
    id: number;

	@ApiProperty({description: 'new displayName of the user', example: 'mamartin'})
    @IsString()
    displayName: string;
    
    @IsString()
	@ApiProperty({description: 'new picture of the user', example: 'new_picture.jpg'})
    picture: string;

    static from(dto: Partial<EditUserDTO>) {
        const user = new EditUserDTO();
        user.id = dto.id;
        user.displayName = dto.displayName;
        user.picture = dto.picture;
        return user;
    }

    toEntity() : DeepPartial<User> {
        const user = new User();
        this.displayName ? user.displayName = this.displayName : user.displayName = null;
        this.picture ? user.picture = this.picture : user.picture = null;
        return user;
    }
}
