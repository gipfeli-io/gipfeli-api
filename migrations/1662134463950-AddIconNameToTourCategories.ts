import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIconNameToTourCategories1662134463950
  implements MigrationInterface
{
  name = 'AddIconNameToTourCategories1662134463950';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const schema = await queryRunner.getCurrentSchema();

    await queryRunner.query(
      `ALTER TABLE "tour_category" ADD "iconName" character varying NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "tour_categories_tour_category" DROP CONSTRAINT "FK_6e326dba3d3aa57afef9dd7294f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tour_category" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "tour_categories_tour_category" ADD CONSTRAINT "FK_6e326dba3d3aa57afef9dd7294f" FOREIGN KEY ("tourCategoryId") REFERENCES "tour_category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    // insert file names
    await queryRunner.query(
      `UPDATE ${schema}.tour_category SET "iconName" = 'running.svg' where "name" = 'Trail Run'`,
    );
    await queryRunner.query(
      `UPDATE ${schema}.tour_category SET "iconName" = 'terrain.svg' where "name" = 'Alpine Tour'`,
    );
    await queryRunner.query(
      `UPDATE ${schema}.tour_category SET "iconName" = 'climbing-with-rope.svg' where "name" = 'Fixed Rope Route'`,
    );
    await queryRunner.query(
      `UPDATE ${schema}.tour_category SET "iconName" = 'climbing.svg' where "name" = 'Climbing Tour'`,
    );
    await queryRunner.query(
      `UPDATE ${schema}.tour_category SET "iconName" = 'snow-shoeing.svg' where "name" = 'Snowshoe Tour'`,
    );
    await queryRunner.query(
      `UPDATE ${schema}.tour_category SET "iconName" = 'skiing.svg' where "name" = 'Ski Tour'`,
    );
    await queryRunner.query(
      `UPDATE ${schema}.tour_category SET "iconName" = 'walking.svg' where "name" = 'Walking Tour'`,
    );
    await queryRunner.query(
      `UPDATE ${schema}.tour_category SET "iconName" = 'hiking.svg' where "name" = 'Hike'`,
    );
    await queryRunner.query(
      `UPDATE ${schema}.tour_category SET "iconName" = 'other.svg' where "name" = 'Other'`,
    );
    await queryRunner.query(
      `UPDATE ${schema}.tour_category SET "iconName" = 'biking.svg' where "name" = 'Bike Tour'`,
    );
    await queryRunner.query(
      `UPDATE ${schema}.tour_category SET "iconName" = 'wheelchair.svg' where "name" = 'Wheelchair Path'`,
    );

    await queryRunner.query(
      `UPDATE ${schema}.tour_category SET "iconName" = 'stroller.svg' where "name" = 'Stroller Trail'`,
    );

    //set svg icon to be non null
    await queryRunner.query(
      `ALTER TABLE "tour_category" ALTER COLUMN "iconName" SET NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tour_categories_tour_category" DROP CONSTRAINT "FK_6e326dba3d3aa57afef9dd7294f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tour_category" ALTER COLUMN "id" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "tour_categories_tour_category" ADD CONSTRAINT "FK_6e326dba3d3aa57afef9dd7294f" FOREIGN KEY ("tourCategoryId") REFERENCES "tour_category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tour_category" DROP COLUMN "iconName"`,
    );
  }
}
