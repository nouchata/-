import { ApiProperty } from "@nestjs/swagger";

class Session2FaContentDTO {
    @ApiProperty({
        description: "Is 2FA activated or not"
    })
    needed: boolean;

    @ApiProperty({
        description: "Current state of 2FA verification"
    })
    passed: boolean;
};

class Session2FaDTO {
    @ApiProperty({
        description: "2FA container in session object",
        type: Session2FaContentDTO
    })
    twofa: Session2FaContentDTO
};

export { Session2FaContentDTO, Session2FaDTO }