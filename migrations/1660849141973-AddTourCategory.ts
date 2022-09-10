import { MigrationInterface, QueryRunner } from 'typeorm';
import { TourCategory } from '../src/tour/entities/tour-category.entity';

export class AddTourCategory1660849141973 implements MigrationInterface {
  name = 'AddTourCategory1660849141973';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "tour_category" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, CONSTRAINT "PK_a39d07fba481badc55803d907d9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "tour_categories_tour_category" ("tourId" uuid NOT NULL, "tourCategoryId" uuid NOT NULL, CONSTRAINT "PK_8eab51370744db36234cbb7c435" PRIMARY KEY ("tourId", "tourCategoryId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a6bc05ecc82fe86df662a53dcf" ON "tour_categories_tour_category" ("tourId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6e326dba3d3aa57afef9dd7294" ON "tour_categories_tour_category" ("tourCategoryId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "tour_categories_tour_category" ADD CONSTRAINT "FK_a6bc05ecc82fe86df662a53dcfa" FOREIGN KEY ("tourId") REFERENCES "tour"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "tour_categories_tour_category" ADD CONSTRAINT "FK_6e326dba3d3aa57afef9dd7294f" FOREIGN KEY ("tourCategoryId") REFERENCES "tour_category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    await queryRunner.query(`
            INSERT INTO tour_category (name)
            VALUES ('Wanderung'), 
            ('Trail Run'), ('Hochtour'), 
            ('Klettersteig'), ('Klettertour'), 
            ('Skitour'), ('Schneeschuhtour'), 
            ('Spaziergang'),
            ('Andere')
        `);

    // Add default category to tours
    const schema = await queryRunner.getCurrentSchema();
    const tours = await queryRunner.query(`SELECT * FROM ${schema}.tour`);
    const categories = await queryRunner.query(
      `SELECT * from ${schema}.tour_category`,
    );

    const category = categories.find(
      (cat: TourCategory) => cat.name === 'Andere',
    );

    for (const tour of tours) {
      await queryRunner.query(
        `INSERT INTO ${schema}.tour_categories_tour_category VALUES($1, $2)`,
        [tour.id, category.id],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tour_categories_tour_category" DROP CONSTRAINT "FK_6e326dba3d3aa57afef9dd7294f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tour_categories_tour_category" DROP CONSTRAINT "FK_a6bc05ecc82fe86df662a53dcfa"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6e326dba3d3aa57afef9dd7294"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a6bc05ecc82fe86df662a53dcf"`,
    );
    await queryRunner.query(`DROP TABLE "tour_categories_tour_category"`);
    await queryRunner.query(`DROP TABLE "tour_category"`);
  }
}
