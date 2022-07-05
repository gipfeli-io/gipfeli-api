import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdateConstraintsOnTour1656680013355 implements MigrationInterface {
    name = 'UpdateConstraintsOnTour1656680013355'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "image" DROP CONSTRAINT "FK_dbd335f757e8acf3646f250199c"`);
        await queryRunner.query(`ALTER TABLE "image" ADD CONSTRAINT "FK_dbd335f757e8acf3646f250199c" FOREIGN KEY ("tourId") REFERENCES "tour"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "image" DROP CONSTRAINT "FK_dbd335f757e8acf3646f250199c"`);
        await queryRunner.query(`ALTER TABLE "image" ADD CONSTRAINT "FK_dbd335f757e8acf3646f250199c" FOREIGN KEY ("tourId") REFERENCES "tour"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
