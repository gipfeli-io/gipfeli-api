import {MigrationInterface, QueryRunner} from "typeorm";

export class RenameFieldsOnTour1652526072830 implements MigrationInterface {
    name = 'RenameFieldsOnTour1652526072830'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tour" DROP COLUMN "CreatedAt"`);
        await queryRunner.query(`ALTER TABLE "tour" DROP COLUMN "UpdatedAt"`);
        await queryRunner.query(`ALTER TABLE "tour" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "tour" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tour" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "tour" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "tour" ADD "UpdatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "tour" ADD "CreatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
    }

}
