import { ChannelDto } from './../dtos/user-channels.dto';
import { LeaveChannelDto } from './../dtos/leave-channel.dto';
import { JoinChannelDto } from './../dtos/join-channel.dto';
import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { GroupGuard } from 'src/auth/guards/group.guard';
import { User } from 'src/user/entities/user.entity';
import { CreateChannelDto } from '../dtos/create-channel.dto';
import { ChannelService } from './channel.service';

@Controller('channel')
export class ChannelController {
	constructor(private channelService: ChannelService) {}

	@Post('create')
	@UseGuards(GroupGuard)
	async createChannel(@Req() req: {user: User}, @Body() channel: CreateChannelDto ): Promise<ChannelDto> {
		return this.channelService.createChannel({...channel, owner: req.user});
	}
	
	@Post('join')
	@UseGuards(GroupGuard)
	async joinChannel(@Req() req: {user: User}, @Body() channel: JoinChannelDto ): Promise<ChannelDto> {
		return this.channelService.joinChannel(channel, req.user);
	}

	@Post('leave')
	@UseGuards(GroupGuard)
	async leaveChannel(@Req() req: {user: User}, @Body() channel: LeaveChannelDto ) {
		this.channelService.leaveChannel(channel.id, req.user);
		return {'status': 'ok'};
	}
}
