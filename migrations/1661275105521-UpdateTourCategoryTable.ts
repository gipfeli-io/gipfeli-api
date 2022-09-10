import { MigrationInterface, QueryRunner } from 'typeorm';
import { TourCategory } from '../src/tour/entities/tour-category.entity';

export class UpdateTourCategoryTable1661275105521
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const schema = await queryRunner.getCurrentSchema();
    const tourCategoriesTourCategoryList = await queryRunner.query(`
            Select * from ${schema}.tour_categories_tour_category
        `);

    const previousTourCategoryList = await queryRunner.query(`
      Select * from ${schema}.tour_category
    `);

    //remove default value on id
    await queryRunner.query(
      `ALTER TABLE ${schema}.tour_category ALTER COLUMN id drop default`,
    );

    //delete existing data
    await queryRunner.query(`
            DELETE from ${schema}.tour_categories_tour_category
        `);

    await queryRunner.query(`
            DELETE from ${schema}.tour_category
        `);

    //re-add data with fixed id
    await queryRunner.query(`
            INSERT INTO ${schema}.tour_category (id, name)
            VALUES ('d3a76ac0-9257-49e1-9656-b27f22e8f610','Trail Run'),
                    ('7a6507dc-ccdb-49da-9da4-bbb59ddef639','Apline Tour'),
                    ('4b167d23-8777-4fac-95ba-310af2bec65d','Fixed Rope Route'),
                    ('599cc425-abb7-4f37-9eff-83c42383f799','Climbing Tour'),
                    ('a529f9ef-3c11-40c0-a293-0fa091bfa330','Snowshoe Tour'),
                    ('a9e105c2-081e-4703-9a86-97d201e163cd','Ski Tour'),
                    ('d9fad132-4fcc-442e-b701-07b4bfe67d76','Walking Tour'),
                    ('7813ea36-7f8d-47f2-9708-70366c046c80','Hike'),
                    ('37471666-7fe4-4a48-b058-91bc80671894','Other'),
                    ('c4c929c6-152d-49bd-8728-165ca27b4098','Bike Tour'),
                    ('d66e0516-d060-43e9-89f5-09e646ee2e23','Stroller Trail'),
                    ('acc0ee55-ab78-430a-936f-f6b734a69f76','Wheelchair Path')`);

    const currentTourCategoryList = await queryRunner.query(`
      Select * from ${schema}.tour_category
    `);

    for (const tourCategoryEntry of tourCategoriesTourCategoryList) {
      const previousTourCategory = previousTourCategoryList.find(
        (cat: TourCategory) => cat.id === tourCategoryEntry.tourCategoryId,
      );

      const newTourCategory = currentTourCategoryList.find(
        (cat: TourCategory) => cat.name === previousTourCategory.name,
      );

      await queryRunner.query(
        `INSERT INTO ${schema}.tour_categories_tour_category VALUES($1, $2)`,
        [tourCategoryEntry.tourId, newTourCategory.id],
      );
    }

    // fix tour name
    await queryRunner.query(`
            UPDATE ${schema}.tour_category SET name = 'Alpine Tour' where id = '7a6507dc-ccdb-49da-9da4-bbb59ddef639'
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('=> UpdateTourCategoryTable1661275105521 cannot be reverted.');
  }
}
