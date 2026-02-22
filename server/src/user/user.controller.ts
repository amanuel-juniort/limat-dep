import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Role, UserStatus } from '@prisma/client';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get('pending-count')
  async getPendingCount() {
    const count = await this.userService.getPendingCount();
    return { count };
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() data: { status?: UserStatus; role?: Role }
  ) {
    return this.userService.update(+id, data);
  }
}
