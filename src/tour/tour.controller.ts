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
import { TourService } from './tour.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateTourDto, TourDto, UpdateTourDto } from './dto/tour';
import { AuthenticatedUserDto } from '../user/dto/user';
import { User } from '../utils/decorators/user.decorator';

@Controller('tours')
@UseGuards(JwtAuthGuard)
export class TourController {
  constructor(private readonly tourService: TourService) {}

  @Post()
  async create(
    @Body() createTourDto: CreateTourDto,
    @User() user: AuthenticatedUserDto,
  ): Promise<TourDto> {
    return this.tourService.create(createTourDto, user);
  }

  @Get()
  async findAll(@User() user: AuthenticatedUserDto): Promise<TourDto[]> {
    return this.tourService.findAll(user);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @User() user: AuthenticatedUserDto,
  ): Promise<TourDto> {
    return this.tourService.findOne(id, user);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTourDto: UpdateTourDto,
    @User() user: AuthenticatedUserDto,
  ): Promise<TourDto> {
    return this.tourService.update(id, updateTourDto, user);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @User() user: AuthenticatedUserDto,
  ): Promise<void> {
    return this.tourService.remove(id, user);
  }
}
