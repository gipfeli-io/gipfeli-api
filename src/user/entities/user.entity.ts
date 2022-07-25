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
import { UserToken, UserTokenType } from './user-token.entity';
import { UserSession } from '../../auth/entities/user-session.entity';
import { Image } from '../../media/entities/image.entity';

export const UNIQUE_USER_EMAIL_CONSTRAINT = 'unique_user_email_constraint';

export enum UserRole {
  ADMINISTRATOR,
  USER,
}

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

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @OneToMany(() => Tour, (tour) => tour.user, {
    cascade: true,
  })
  tours: Tour[];

  @OneToMany(() => UserToken, (userToken) => userToken.user, {
    cascade: true,
  })
  tokens: UserToken[];

  @OneToMany(() => UserSession, (userSession) => userSession.user, {
    cascade: true,
  })
  sessions: UserToken[];

  @OneToMany(() => Image, (image) => image.user, {
    cascade: true,
  })
  images: Image[];
}
