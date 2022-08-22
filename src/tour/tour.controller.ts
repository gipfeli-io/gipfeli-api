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
import { CreateTourDto, TourDto } from './dto/tour.dto';
import { AuthenticatedUserDto } from '../user/dto/user.dto';
import { User } from '../utils/decorators/user.decorator';
import { UpdateTourDto } from './dto/tour.dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { GenericStatusResponseWithContent } from '../utils/types/response';

@ApiBearerAuth('default')
@ApiTags('tours')
@Controller('tours')
@ApiUnauthorizedResponse({ description: 'Thrown if user is not logged in.' })
@UseGuards(JwtAuthGuard)
export class TourController {
  constructor(private readonly tourService: TourService) {}

  /**
   * Creates a new tour for a given user.
   * @param createTourDto
   * @param user
   */
  @ApiBadRequestResponse({
    description:
      'Thrown if there are validation errors or otherwise bad requests.',
    type: GenericStatusResponseWithContent,
  })
  @Post()
  async create(
    @Body() createTourDto: CreateTourDto,
    @User() user: AuthenticatedUserDto,
  ): Promise<TourDto> {
    return this.tourService.create(createTourDto, user);
  }

  /**
   * Returns all tours for a given user.
   * @param user
   */
  @Get()
  async findAll(@User() user: AuthenticatedUserDto): Promise<TourDto[]> {
    return this.tourService.findAll(user);
  }

  /**
   * Returns a specific tour for a given user.
   * @param id
   * @param user
   */
  @ApiNotFoundResponse({ description: 'Thrown if tour could not be found.' })
  @ApiParam({ name: 'id', description: 'Tour identifier' })
  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @User() user: AuthenticatedUserDto,
  ): Promise<TourDto> {
    return this.tourService.findOne(id, user);
  }

  /**
   * Updates a specific tour for a given user.
   * @param id
   * @param updateTourDto
   * @param user
   */
  @ApiBadRequestResponse({
    description:
      'Thrown if there are validation errors or otherwise bad requests.',
    type: GenericStatusResponseWithContent,
  })
  @ApiNotFoundResponse({ description: 'Thrown if tour could not be found.' })
  @ApiParam({ name: 'id', description: 'Tour identifier' })
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTourDto: UpdateTourDto,
    @User() user: AuthenticatedUserDto,
  ): Promise<TourDto> {
    return this.tourService.update(id, updateTourDto, user);
  }

  /**
   * Deletes a specific tour for a given user.
   * @param id
   * @param user
   */
  @ApiNotFoundResponse({ description: 'Thrown if tour could not be found.' })
  @ApiParam({ name: 'id', description: 'Tour identifier' })
  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @User() user: AuthenticatedUserDto,
  ): Promise<void> {
    return this.tourService.remove(id, user);
  }
}
