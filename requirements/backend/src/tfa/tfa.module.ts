import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "src/user/entities/user.entity";
import { TfaController } from "./tfa.controller";
import { TfaService } from "./tfa.service";

@Module({
	imports: [TypeOrmModule.forFeature([User])],
	controllers: [TfaController],
	providers: [TfaService]
})
export class TfaModule {}
