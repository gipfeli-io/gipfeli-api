import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNewTourCategoryNames1661005020983
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            INSERT INTO tour_category (name)
            VALUES ('Bike Tour'), 
            ('Stroller Trail'), ('Wheelchair Path')
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('=> AddNewTourCategoryNames1661005020983 cannot be reverted.');
  }
}
