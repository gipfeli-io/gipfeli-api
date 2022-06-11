import { Column, Entity, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Tour } from '../../tour/entities/tour.entity';

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

  @Column()
  password: string;

  @OneToMany(() => Tour, (tour) => tour.user)
  tours: Tour[];
}
