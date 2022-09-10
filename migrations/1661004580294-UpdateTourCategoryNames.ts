import { MigrationInterface, QueryRunner } from 'typeorm';
import { TourCategory } from '../src/tour/entities/tour-category.entity';

export class UpdateTourCategoryNames1661004580294
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const categoryList = [
      ['Hochtour', 'Apline Tour'],
      ['Klettersteig', 'Fixed Rope Route'],
      ['Klettertour', 'Climbing Tour'],
      ['Schneeschuhtour', 'Snowshoe Tour'],
      ['Skitour', 'Ski Tour'],
      ['Spaziergang', 'Walking Tour'],
      ['Wanderung', 'Hike'],
      ['Andere', 'Other'],
      ['Klettertour', 'Hochtour'],
    ];

    for (const category of categoryList) {
      await queryRunner.manager.update(
        TourCategory,
        { name: category[0] },
        { name: category[1] },
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const categoryList = [
      ['Hochtour', 'Apline Tour'],
      ['Klettersteig', 'Fixed Rope Route'],
      ['Klettertour', 'Climbing Tour'],
      ['Schneeschuhtour', 'Snowshoe Tour'],
      ['Skitour', 'Ski Tour'],
      ['Spaziergang', 'Walking Tour'],
      ['Wanderung', 'Hike'],
      ['Andere', 'Other'],
      ['Klettertour', 'Hochtour'],
    ];

    for (const category of categoryList) {
      await queryRunner.manager.update(
        TourCategory,
        { name: category[1] },
        { name: category[0] },
      );
    }
  }
}
