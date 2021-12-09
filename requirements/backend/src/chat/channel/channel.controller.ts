import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { GroupGuard } from 'src/auth/guards/group.guard';
import { User } from 'src/user/entities/user.entity';
import { CreateChannelDto } from '../dtos/create-channel.dto';
import { Channel } from '../entities/channel.entity';
import { ChannelService } from './channel.service';

@Controller('channel')
export class ChannelController {
	constructor(private readonly channelService: ChannelService) {}

	@Post('create')
	@UseGuards(GroupGuard)
	async createChannel(@Req() req: {user: User}, @Body() channel: CreateChannelDto ): Promise<Channel> {
		return this.channelService.createChannel({...channel, owner: req.user});
	}
}
