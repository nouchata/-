import { ApiProperty } from '@nestjs/swagger';

class SessionOnlineStateDTO {
	@ApiProperty({
		description: 'Callback who manages online state',
	})
	keepUpOnlineState: (() => void) | undefined = undefined;
}

export { SessionOnlineStateDTO };
