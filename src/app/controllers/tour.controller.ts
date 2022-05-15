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
import { DeleteResult } from 'typeorm';

@Controller('tours')
@UseGuards(JwtAuthGuard)
export class TourController {
  constructor(private readonly tourService: TourService) {}

  @Post()
  async create(@Body() createTourDto: CreateTourDto): Promise<TourDto> {
    return await this.tourService.create(createTourDto);
  }

  @Get()
  findAll(): Promise<TourDto[]> {
    // Todo: async not required -> do we use it?
    return this.tourService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<TourDto> {
    return this.tourService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTourDto: UpdateTourDto,
  ): Promise<TourDto> {
    return this.tourService.update(id, updateTourDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<DeleteResult> {
    return this.tourService.remove(id);
  }
}
