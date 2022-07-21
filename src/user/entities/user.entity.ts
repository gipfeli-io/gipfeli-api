import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Tour } from '../../tour/entities/tour.entity';
import { UserToken } from './user-token.entity';
import { UserSession } from '../../auth/entities/user-session.entity';
import { Image } from '../../media/entities/image.entity';

export const UNIQUE_USER_EMAIL_CONSTRAINT = 'unique_user_email_constraint';

@Entity()
@Unique(UNIQUE_USER_EMAIL_CONSTRAINT, ['email'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  email: string;

  @Column({ select: false })
  password: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: false })
  isActive: boolean;

  @OneToMany(() => Tour, (tour) => tour.user)
  tours: Tour[];

  @OneToMany(() => UserToken, (userToken) => userToken.user)
  tokens: UserToken[];

  @OneToMany(() => UserSession, (userSession) => userSession.user)
  sessions: UserToken[];

  @OneToMany(() => Image, (image) => image.user, {
    cascade: true,
    onDelete: 'CASCADE', // todo: this should be changed so we do not immediately delete images when a user is deleted.
  })
  images: Image[];
}
