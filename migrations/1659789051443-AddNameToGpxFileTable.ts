import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNameToGpxFileTable1659789051443 implements MigrationInterface {
  name = 'AddNameToGpxFileTable1659789051443';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "gpx_file" ADD "name" character varying`,
    );
    await queryRunner.query(`UPDATE "gpx_file" SET "name"="identifier"`);
    await queryRunner.query(
      `ALTER TABLE "gpx_file" ALTER COLUMN "name" SET NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "gpx_file" DROP COLUMN "name"`);
  }
}
