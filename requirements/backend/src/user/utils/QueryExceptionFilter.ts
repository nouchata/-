import { ArgumentsHost, Catch, ConflictException, ExceptionFilter, HttpStatus, InternalServerErrorException } from "@nestjs/common";
import { Request, Response } from 'express';
import { QueryFailedError } from "typeorm";

@Catch(QueryFailedError)
export class QueryExceptionFilter implements ExceptionFilter {
  catch(exception: QueryFailedError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    let status = HttpStatus.INTERNAL_SERVER_ERROR;

    if (exception.driverError.code === '23505') { // unique field error
      status = HttpStatus.CONFLICT;
      response
        .status(status)
        .json({
          statusCode: status,
          message: `${request.body.username} is already taken.`
        });
    } else {
      response
        .status(status)
        .json({
          statusCode: status
        });
    }
  }
}
