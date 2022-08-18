import {
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserDto } from './dto/user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('users')
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * Returns all users. Requires an admin account.
   */
  @Get()
  @UseGuards(AdminGuard)
  async findAll(): Promise<UserDto[]> {
    return this.userService.findAll();
  }

  /**
   * Deletes a given user. Requires an admin account.
   * @param id
   */
  @ApiParam({ name: 'id', description: 'User identifier' })
  @Delete(':id')
  @UseGuards(AdminGuard)
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.userService.remove(id);
  }
}
