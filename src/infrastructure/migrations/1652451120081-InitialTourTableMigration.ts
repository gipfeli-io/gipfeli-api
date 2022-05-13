import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialTourTableMigration1652451120081
  implements MigrationInterface
{
  name = 'InitialTourTableMigration1652451120081';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS postgis`);

    await queryRunner.query(
      `CREATE TABLE "tour" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "startLocation" geometry(Point,4326), "endLocation" geometry(Point,4326), "description" text NOT NULL, "CreatedAt" TIMESTAMP NOT NULL DEFAULT now(), "UpdatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "PK_972cd7fa4ec39286068130fa3f7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8ea60097c7fe7d31fb2c26b6e6" ON "tour" USING GiST ("startLocation") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_24f5f1d53fb1c8f396e50ae79d" ON "tour" USING GiST ("endLocation") `,
    );
    await queryRunner.query(
      `ALTER TABLE "tour" ADD CONSTRAINT "FK_d305ffb20137507c3ac63e128e4" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tour" DROP CONSTRAINT "FK_d305ffb20137507c3ac63e128e4"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_24f5f1d53fb1c8f396e50ae79d"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8ea60097c7fe7d31fb2c26b6e6"`,
    );
    await queryRunner.query(`DROP TABLE "tour"`);
    await queryRunner.query(`DROP EXTENSION IF EXISTS postgis`);
  }
}
