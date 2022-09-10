import {MigrationInterface, QueryRunner} from "typeorm";

export class AddOnDeleteConstraints1656618186474 implements MigrationInterface {
    name = 'AddOnDeleteConstraints1656618186474'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "image" DROP CONSTRAINT "FK_dc40417dfa0c7fbd70b8eb880cc"`);
        await queryRunner.query(`ALTER TABLE "image" DROP CONSTRAINT "FK_dbd335f757e8acf3646f250199c"`);
        await queryRunner.query(`ALTER TABLE "image" ADD CONSTRAINT "FK_dc40417dfa0c7fbd70b8eb880cc" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "image" ADD CONSTRAINT "FK_dbd335f757e8acf3646f250199c" FOREIGN KEY ("tourId") REFERENCES "tour"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "image" DROP CONSTRAINT "FK_dbd335f757e8acf3646f250199c"`);
        await queryRunner.query(`ALTER TABLE "image" DROP CONSTRAINT "FK_dc40417dfa0c7fbd70b8eb880cc"`);
        await queryRunner.query(`ALTER TABLE "image" ADD CONSTRAINT "FK_dbd335f757e8acf3646f250199c" FOREIGN KEY ("tourId") REFERENCES "tour"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "image" ADD CONSTRAINT "FK_dc40417dfa0c7fbd70b8eb880cc" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
