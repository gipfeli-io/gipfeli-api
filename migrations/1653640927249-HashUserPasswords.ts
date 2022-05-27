import { MigrationInterface, QueryRunner } from 'typeorm';
import { User } from '../src/user/entities/user.entity';
import * as bcrypt from 'bcrypt';

/**
 * This is a one-off migration that hashes existing user passwords, because this
 * was only implemented after initial deployments. As a convenience, the users
 * that already exist are getting hashed, so the staging area still works.
 */
export class HashUserPasswords1653640927249 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const users = await queryRunner.manager.find(User);

    for (const user of users) {
      user.password = bcrypt.hashSync(user.password, 10);
    }

    await queryRunner.manager.save(users);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('=> HashUserPasswords1653640927249 cannot be reverted.');
  }
}
