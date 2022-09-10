import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Tour } from '../src/tour/entities/tour.entity';

/**
 * This migration fixes the wrong @JoinColumn field by moving it from the
 * GpxFile to the Tour. It also migrates existing GPX files.
 */
export class AddJoinColumnToTourForGpxRelation1660651644364
  implements MigrationInterface
{
  name = 'AddJoinColumnToTourForGpxRelation1660651644364';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Setup the new field on Tour
    await queryRunner.query(`ALTER TABLE "tour" ADD "gpxFileId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "tour" ADD CONSTRAINT "UQ_667aab08e8a0d1b02bd4ad7eea2" UNIQUE ("gpxFileId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "tour" ADD CONSTRAINT "FK_667aab08e8a0d1b02bd4ad7eea2" FOREIGN KEY ("gpxFileId") REFERENCES "gpx_file"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );

    // Migrate existing data by selecting all gpxFiles, finding their
    // corresponding tour and then updating the tour to set the newly create field
    const schema = await queryRunner.getCurrentSchema();
    const gpxFiles = await queryRunner.query(
      `SELECT * FROM ${schema}.gpx_file WHERE "tourId" IS NOT NULL`,
    );

    for (const gpxFile of gpxFiles) {
      const tours = await queryRunner.query(
        `SELECT * FROM ${schema}.tour WHERE id='${gpxFile.tourId}'`,
      );

      if (tours.length === 1) {
        await queryRunner.query(
          `UPDATE ${schema}.tour SET "gpxFileId"=$1 WHERE id=$2`,
          [gpxFile.id, tours[0].id],
        );
      }
    }

    // Remove the JoinColumn from the GpxFile
    await queryRunner.query(
      `ALTER TABLE "gpx_file" DROP CONSTRAINT "FK_f781bfb25287d6183600114bb36"`,
    );
    await queryRunner.query(
      `ALTER TABLE "gpx_file" DROP CONSTRAINT "REL_f781bfb25287d6183600114bb3"`,
    );
    await queryRunner.query(`ALTER TABLE "gpx_file" DROP COLUMN "tourId"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Re-add to GpxFile
    await queryRunner.query(`ALTER TABLE "gpx_file" ADD "tourId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "gpx_file" ADD CONSTRAINT "REL_f781bfb25287d6183600114bb3" UNIQUE ("tourId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "gpx_file" ADD CONSTRAINT "FK_f781bfb25287d6183600114bb36" FOREIGN KEY ("tourId") REFERENCES "tour"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );

    // Migrate data back
    const schema = await queryRunner.getCurrentSchema();
    const tours = await queryRunner.query(
      `SELECT * FROM ${schema}.tour WHERE "gpxFileId" IS NOT NULL`,
    );

    for (const tour of tours) {
      const gpxFiles = await queryRunner.query(
        `SELECT * FROM ${schema}.gpx_file WHERE id='${tour.gpxFileId}'`,
      );

      if (gpxFiles.length === 1) {
        await queryRunner.query(
          `UPDATE ${schema}.gpx_file SET "tourId"=$1 WHERE id=$2`,
          [tour.id, gpxFiles[0].id],
        );
      }
    }

    // Remove from Tour
    await queryRunner.query(
      `ALTER TABLE "tour" DROP CONSTRAINT "FK_667aab08e8a0d1b02bd4ad7eea2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tour" DROP CONSTRAINT "UQ_667aab08e8a0d1b02bd4ad7eea2"`,
    );
    await queryRunner.query(`ALTER TABLE "tour" DROP COLUMN "gpxFileId"`);
  }
}
