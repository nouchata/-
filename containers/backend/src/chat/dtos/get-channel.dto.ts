import { ApiProperty } from '@nestjs/swagger';
import { ChannelType } from '../entities/channel.entity';

export class GetChannelDto {
	@ApiProperty({ description: 'The id of the channel.', example: 1 })
	id: number;
	@ApiProperty({
		description: 'The name of the channel.',
		example: 'channel1',
	})
	name: string;
	@ApiProperty({ description: 'The type of the channel.', example: 'public' })
	channelType: ChannelType;
}
