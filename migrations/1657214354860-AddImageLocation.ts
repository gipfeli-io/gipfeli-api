import {MigrationInterface, QueryRunner} from "typeorm";

export class AddImageLocation1657214354860 implements MigrationInterface {
    name = 'AddImageLocation1657214354860'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "image" ADD "location" geometry(Point,4326)`);
        await queryRunner.query(`CREATE INDEX "IDX_cc48323d43000dc682043798dc" ON "image" USING GiST ("location") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_cc48323d43000dc682043798dc"`);
        await queryRunner.query(`ALTER TABLE "image" DROP COLUMN "location"`);
    }

}
