import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcrypt';

/**
 * This is a one-off migration that hashes existing user passwords, because this
 * was only implemented after initial deployments. As a convenience, the users
 * that already exist are getting hashed, so the staging area still works.
 */
export class HashUserPasswords1653640927249 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    /**
     * Since the user table changed, we cannot use .find(User), because the current entity does not match the one we
     * have at this state in the database. That is why we have to use this pure SQL script, otherwise new setups will
     * fail.
     */
    const schema = await queryRunner.getCurrentSchema();
    const users = await queryRunner.query(`SELECT * FROM ${schema}.user`);

    for (const user of users) {
      user.password = bcrypt.hashSync(user.password, 10);
    }

    await queryRunner.manager.save(users);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('=> HashUserPasswords1653640927249 cannot be reverted.');
  }
}
