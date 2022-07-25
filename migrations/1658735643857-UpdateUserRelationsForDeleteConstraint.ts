import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdateUserRelationsForDeleteConstraint1658735643857 implements MigrationInterface {
    name = 'UpdateUserRelationsForDeleteConstraint1658735643857'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tour" DROP CONSTRAINT "FK_d305ffb20137507c3ac63e128e4"`);
        await queryRunner.query(`ALTER TABLE "user_token" DROP CONSTRAINT "FK_d37db50eecdf9b8ce4eedd2f918"`);
        await queryRunner.query(`ALTER TABLE "user_session" DROP CONSTRAINT "FK_b5eb7aa08382591e7c2d1244fe5"`);
        await queryRunner.query(`ALTER TABLE "tour" ADD CONSTRAINT "FK_d305ffb20137507c3ac63e128e4" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_token" ADD CONSTRAINT "FK_d37db50eecdf9b8ce4eedd2f918" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_session" ADD CONSTRAINT "FK_b5eb7aa08382591e7c2d1244fe5" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_session" DROP CONSTRAINT "FK_b5eb7aa08382591e7c2d1244fe5"`);
        await queryRunner.query(`ALTER TABLE "user_token" DROP CONSTRAINT "FK_d37db50eecdf9b8ce4eedd2f918"`);
        await queryRunner.query(`ALTER TABLE "tour" DROP CONSTRAINT "FK_d305ffb20137507c3ac63e128e4"`);
        await queryRunner.query(`ALTER TABLE "user_session" ADD CONSTRAINT "FK_b5eb7aa08382591e7c2d1244fe5" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_token" ADD CONSTRAINT "FK_d37db50eecdf9b8ce4eedd2f918" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tour" ADD CONSTRAINT "FK_d305ffb20137507c3ac63e128e4" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
