import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Tour } from './tour.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstname: string;

  @Column()
  lastname: string;

  @Column()
  username: string;

  @Column()
  password: string;

  @OneToMany(() => Tour, (tour) => tour.user)
  tours: Tour[];
}
