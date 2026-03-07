import { Controller, Get, Param } from '@nestjs/common';
import { DevService } from './dev.service';

@Controller('dev')
export class DevController {
  constructor(private readonly devService: DevService) {}

  @Get('reset-all-stock/:password')
  resetAllStock(@Param('password') password: string) {
    if (password !== 'limat123') {
      // throw new BadRequestException('Invalid password');
      return "Invalid password";
    }
    return this.devService.resetAllInventoryStock();
  }
}