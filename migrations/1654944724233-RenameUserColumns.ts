import {MigrationInterface, QueryRunner} from "typeorm";

export class RenameUserColumns1654944724233 implements MigrationInterface {
    name = 'RenameUserColumns1654944724233'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "firstname" TO "firstName"`);
        await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "lastname" TO "lastName"`);
        await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "username" TO "email"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "firstName" TO "firstname"`);
        await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "lastName" TO "lastname"`);
        await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "email" TO "username"`);
    }

}
