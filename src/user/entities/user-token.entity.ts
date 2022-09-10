import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum UserTokenType {
  PASSWORD_RESET,
  ACCOUNT_ACTIVATION,
}

@Entity()
export class UserToken {
  @PrimaryColumn()
  token: string;

  @Column({
    type: 'enum',
    enum: UserTokenType,
    default: UserTokenType.PASSWORD_RESET,
  })
  tokenType: UserTokenType;

  @CreateDateColumn()
  createdAt: Date;

  @PrimaryColumn()
  userId: string;

  @ManyToOne(() => User, (user) => user.tokens, {
    onDelete: 'CASCADE',
  })
  user: User;
}
