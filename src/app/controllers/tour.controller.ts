import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { TourService } from '../../core/services/tour.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateTourDto, TourDto, UpdateTourDto } from '../../core/dtos/tour';
import { UserDto } from '../../core/dtos/user';
import { User } from '../decorators/user.decorator';

@Controller('tours')
@UseGuards(JwtAuthGuard)
export class TourController {
  constructor(private readonly tourService: TourService) {}

  @Post()
  async create(
    @Body() createTourDto: CreateTourDto,
    @User() user: UserDto,
  ): Promise<TourDto> {
    return await this.tourService.create(createTourDto, user);
  }

  @Get()
  findAll(@User() user: UserDto): Promise<TourDto[]> {
    // Todo: async not required -> do we use it?
    return this.tourService.findAll(user);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @User() user: UserDto,
  ): Promise<TourDto> {
    return this.tourService.findOne(id, user);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTourDto: UpdateTourDto,
    @User() user: UserDto,
  ): Promise<TourDto> {
    return this.tourService.update(id, updateTourDto, user);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @User() user: UserDto,
  ): Promise<void> {
    return this.tourService.remove(id, user);
  }
}
