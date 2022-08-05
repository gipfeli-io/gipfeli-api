import {MigrationInterface, QueryRunner} from "typeorm";

export class AddGpxFileEntity1659684153277 implements MigrationInterface {
    name = 'AddGpxFileEntity1659684153277'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "gpx_file" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "identifier" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, "tourId" uuid, CONSTRAINT "REL_f781bfb25287d6183600114bb3" UNIQUE ("tourId"), CONSTRAINT "PK_c0679f296e3eddf90376457791b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "tour" DROP CONSTRAINT "FK_d305ffb20137507c3ac63e128e4"`);
        await queryRunner.query(`ALTER TABLE "tour" ALTER COLUMN "userId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tour" ALTER COLUMN "userId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "gpx_file" ADD CONSTRAINT "FK_9f4667ca38cfa6c9bd054f6c6b4" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "gpx_file" ADD CONSTRAINT "FK_f781bfb25287d6183600114bb36" FOREIGN KEY ("tourId") REFERENCES "tour"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tour" ADD CONSTRAINT "FK_d305ffb20137507c3ac63e128e4" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tour" DROP CONSTRAINT "FK_d305ffb20137507c3ac63e128e4"`);
        await queryRunner.query(`ALTER TABLE "gpx_file" DROP CONSTRAINT "FK_f781bfb25287d6183600114bb36"`);
        await queryRunner.query(`ALTER TABLE "gpx_file" DROP CONSTRAINT "FK_9f4667ca38cfa6c9bd054f6c6b4"`);
        await queryRunner.query(`ALTER TABLE "tour" ALTER COLUMN "userId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tour" ALTER COLUMN "userId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tour" ADD CONSTRAINT "FK_d305ffb20137507c3ac63e128e4" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`DROP TABLE "gpx_file"`);
    }

}
