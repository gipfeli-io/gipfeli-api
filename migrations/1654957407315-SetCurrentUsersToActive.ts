import { MigrationInterface, QueryRunner } from 'typeorm';
import { User } from '../src/user/entities/user.entity';

/**
 * This is a one-off migration that sets existing users to active, because this
 * was only implemented after initial deployments. As a convenience, the users
 * that already exist are set to active, so the staging area still works.
 */
export class SetCurrentUsersToActive1654957407315
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const users = await queryRunner.manager.find(User);

    for (const user of users) {
      user.isActive = true;
    }

    await queryRunner.manager.save(users);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const users = await queryRunner.manager.find(User);

    for (const user of users) {
      user.isActive = false;
    }

    await queryRunner.manager.save(users);
  }
}
