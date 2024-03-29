import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TourCategoryDto } from '../tour/dto/tour-category.dto';
import { LookupService } from './lookup.service';
import { GenericStatusResponseWithContent } from '../utils/types/response';

@ApiBearerAuth('default')
@ApiTags('lookup')
@ApiUnauthorizedResponse({
  description:
    'Thrown if there are validation errors or otherwise bad requests.',
  type: GenericStatusResponseWithContent,
})
@Controller('lookup')
@UseGuards(JwtAuthGuard)
export class LookupController {
  constructor(private readonly lookupService: LookupService) {}

  /**
   * Returns all tour categories
   */
  @Get('tour-categories')
  async findAllTourCategories(): Promise<TourCategoryDto[]> {
    return this.lookupService.findAllTourCategories();
  }
}
