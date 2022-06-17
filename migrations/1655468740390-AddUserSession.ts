import {MigrationInterface, QueryRunner} from "typeorm";

export class AddUserSession1655468740390 implements MigrationInterface {
    name = 'AddUserSession1655468740390'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user_session" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid NOT NULL, CONSTRAINT "PK_adf3b49590842ac3cf54cac451a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user_session" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "user_session" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "user_session" ADD "validUntil" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "user_session" ADD CONSTRAINT "FK_b5eb7aa08382591e7c2d1244fe5" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_session" DROP CONSTRAINT "FK_b5eb7aa08382591e7c2d1244fe5"`);
        await queryRunner.query(`ALTER TABLE "user_session" DROP COLUMN "validUntil"`);
        await queryRunner.query(`ALTER TABLE "user_session" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "user_session" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`DROP TABLE "user_session"`);
    }

}
