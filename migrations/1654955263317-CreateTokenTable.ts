import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateTokenTable1654955263317 implements MigrationInterface {
    name = 'CreateTokenTable1654955263317'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."user_token_tokentype_enum" AS ENUM('0', '1')`);
        await queryRunner.query(`CREATE TABLE "user_token" ("token" character varying NOT NULL, "tokenType" "public"."user_token_tokentype_enum" NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid NOT NULL, CONSTRAINT "PK_703b821a49a52f3d47df9127c0b" PRIMARY KEY ("token", "userId"))`);
        await queryRunner.query(`ALTER TABLE "user" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "user" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "user" ADD "isActive" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "user_token" ADD CONSTRAINT "FK_d37db50eecdf9b8ce4eedd2f918" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_token" DROP CONSTRAINT "FK_d37db50eecdf9b8ce4eedd2f918"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "isActive"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "createdAt"`);
        await queryRunner.query(`DROP TABLE "user_token"`);
        await queryRunner.query(`DROP TYPE "public"."user_token_tokentype_enum"`);
    }

}
