import {MigrationInterface, QueryRunner} from "typeorm";

export class SpecifyUniqueConstraintOnUser1654951687275 implements MigrationInterface {
    name = 'SpecifyUniqueConstraintOnUser1654951687275'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "unique_user_email_constraint" UNIQUE ("email")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "unique_user_email_constraint"`);
    }

}
