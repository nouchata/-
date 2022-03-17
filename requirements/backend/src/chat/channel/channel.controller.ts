import { PunishmentDto, PunishmentType } from './../entities/punishment.entity';
import { Delete, Param } from '@nestjs/common';
import { CreatePunishmentDto } from './../dtos/create-punishment.dto';
import { GetChannelDto } from './../dtos/get-channel.dto';
import { ChannelDto } from './../dtos/user-channels.dto';
import { LeaveChannelDto } from './../dtos/leave-channel.dto';
import { JoinChannelDto } from './../dtos/join-channel.dto';
import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { GroupGuard } from 'src/auth/guards/group.guard';
import { User } from 'src/user/entities/user.entity';
import { CreateChannelDto } from '../dtos/create-channel.dto';
import { ChannelService } from './channel.service';
import { ApiResponse } from '@nestjs/swagger';

@Controller('channel')
export class ChannelController {
	constructor(private channelService: ChannelService) {}

	@Post('create')
	@UseGuards(GroupGuard)
	@ApiResponse({
		status: 201,
		description: 'The channel has been created',
		type: CreateChannelDto,
	})
	async createChannel(
		@Req() req: { user: User },
		@Body() channel: CreateChannelDto
	): Promise<ChannelDto> {
		return this.channelService.createChannel({
			...channel,
			owner: req.user,
		});
	}

	@Post('join')
	@UseGuards(GroupGuard)
	@ApiResponse({
		status: 201,
		description: 'The channel has been joined',
		type: ChannelDto,
	})
	async joinChannel(
		@Req() req: { user: User },
		@Body() channel: JoinChannelDto
	): Promise<ChannelDto> {
		return this.channelService.joinChannel(channel, req.user);
	}

	@Post('leave')
	@UseGuards(GroupGuard)
	@ApiResponse({
		status: 201,
		description: 'leave the channel',
	})
	async leaveChannel(
		@Req() req: { user: User },
		@Body() channel: LeaveChannelDto
	) {
		this.channelService.leaveChannel(channel.id, req.user);
		return { status: 'ok', message: 'left channel' };
	}

	@Get('public')
	@UseGuards(GroupGuard)
	@ApiResponse({
		status: 201,
		description: 'The list of public channels',
		type: [GetChannelDto],
	})
	async getPublicChannels(): Promise<GetChannelDto[]> {
		return (await this.channelService.getPublicChannels()).map(
			(channel) => {
				const getChannelDto: GetChannelDto = {
					id: channel.id,
					name: channel.name,
					channelType: channel.channelType,
				};
				return getChannelDto;
			}
		);
	}

	@Get('protected')
	@UseGuards(GroupGuard)
	@ApiResponse({
		status: 201,
		description: 'The list of protected channels',
		type: [GetChannelDto],
	})
	async getProtectedChannels(): Promise<GetChannelDto[]> {
		return (await this.channelService.getProtectedChannels()).map(
			(channel) => {
				const getChannelDto: GetChannelDto = {
					id: channel.id,
					name: channel.name,
					channelType: channel.channelType,
				};
				return getChannelDto;
			}
		);
	}

	@Get('publicprotected')
	@UseGuards(GroupGuard)
	@Get('protected')
	@UseGuards(GroupGuard)
	@ApiResponse({
		status: 201,
		description: 'The list of protected and public channels',
		type: [GetChannelDto],
	})
	async getPublicAndProtectedChannels(): Promise<GetChannelDto[]> {
		return (await this.channelService.getPublicAndProtectedChannels()).map(
			(channel) => {
				const getChannelDto: GetChannelDto = {
					id: channel.id,
					name: channel.name,
					channelType: channel.channelType,
				};
				return getChannelDto;
			}
		);
	}

	@Post('punishment')
	@UseGuards(GroupGuard)
	@ApiResponse({
		status: 201,
		description: 'create a punishment',
		type: PunishmentDto,
	})
	async createPunishment(
		@Req() req: { user: User },
		@Body() createPunishmentDto: CreatePunishmentDto
	) {
		return await this.channelService.createPunishment(
			req.user,
			createPunishmentDto
		);
	}

	@Get('punishment/:channelId')
	@UseGuards(GroupGuard)
	@ApiResponse({
		status: 201,
		description: 'get punishments for user',
		type: [PunishmentDto],
	})
	async getPunishments(
		@Req() req: { user: User },
		@Param('channelId') channelId: number
	) {
		return await this.channelService.getChannelPunishments(
			channelId,
			req.user
		);
	}

	@Delete('punishment/:channelId/:userId/:punishmentType')
	@UseGuards(GroupGuard)
	@ApiResponse({
		status: 201,
		description: 'delete punishment',
		type: [PunishmentDto],
	})
	async deletePunishment(
		@Req() req: { user: User },
		@Param('channelId') channelId: number,
		@Param('userId') userId: number,
		@Param('punishmentType') punishmentType: PunishmentType
	) {
		return await this.channelService.deletePunishment(
			channelId,
			userId,
			req.user,
			punishmentType
		);
	}
}
