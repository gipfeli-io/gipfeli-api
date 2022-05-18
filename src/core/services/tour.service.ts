import { Injectable } from '@nestjs/common';
import { CreateTourDto } from '../dtos/create-tour.dto';
import { UpdateTourDto } from '../dtos/update-tour.dto';

@Injectable()
export class TourService {
  create(createTourDto: CreateTourDto) {
    return 'This action adds a new tour';
  }

  findAll() {
    return `This action returns all tours`;
  }

  findOne(id: number) {
    return `This action returns a #${id} tour`;
  }

  update(id: number, updateTourDto: UpdateTourDto) {
    return `This action updates a #${id} tour`;
  }

  remove(id: number) {
    return `This action removes a #${id} tour`;
  }
}
