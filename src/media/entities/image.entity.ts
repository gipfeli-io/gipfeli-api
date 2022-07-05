import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Tour } from '../../tour/entities/tour.entity';

@Entity()
export class Image {
  //Todo: should we save the provider as well? a bit overkill, but...
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  identifier: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.images, { onDelete: 'CASCADE' }) // see todo in user
  user?: User;

  @Column({ nullable: true })
  tourId: string | null;

  @ManyToOne(() => Tour, (tour) => tour.images, { onDelete: 'SET NULL' })
  tour?: Tour | null;
}
