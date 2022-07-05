import {MigrationInterface, QueryRunner} from "typeorm";

export class AddImageEntity1656072811820 implements MigrationInterface {
    name = 'AddImageEntity1656072811820'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "image" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "identifier" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid NOT NULL, "tourId" uuid, CONSTRAINT "PK_d6db1ab4ee9ad9dbe86c64e4cc3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "image" ADD CONSTRAINT "FK_dc40417dfa0c7fbd70b8eb880cc" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "image" ADD CONSTRAINT "FK_dbd335f757e8acf3646f250199c" FOREIGN KEY ("tourId") REFERENCES "tour"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "image" DROP CONSTRAINT "FK_dbd335f757e8acf3646f250199c"`);
        await queryRunner.query(`ALTER TABLE "image" DROP CONSTRAINT "FK_dc40417dfa0c7fbd70b8eb880cc"`);
        await queryRunner.query(`DROP TABLE "image"`);
    }

}
