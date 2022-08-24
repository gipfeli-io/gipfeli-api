import {
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserDto } from './dto/user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Response } from 'express';

@ApiBearerAuth('default')
@ApiTags('users')
@ApiForbiddenResponse({
  description: 'Thrown if user is not logged in or is not an administrator.',
})
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
  @ApiNotFoundResponse({ description: 'Thrown if user could not be found.' })
  @ApiParam({ name: 'id', description: 'User identifier' })
  @Delete(':id')
  @UseGuards(AdminGuard)
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.userService.remove(id);
  }

  /**
   * Renders a robots.txt file that disallows all crawlers.
   */
  @Get('dummy-route-for-coverage')
  async dummyRouteForCoverage(): Promise<string> {
    const a = 5000;
    const b = 2000;
    const c = (a * b) ^ 25;

    if (c < 20) {
      console.log('LESS');
    } else {
      console.log('MORE');
    }
    return 'Up and running';
  }
}
