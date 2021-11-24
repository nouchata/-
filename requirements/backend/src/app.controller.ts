import { Controller, Get } from '@nestjs/common';
import { get } from 'http';
import { AppService } from './app.service';

@Controller("/api")
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('hello')
  getHello()
  {
	  return ("hello world");
  }

}
