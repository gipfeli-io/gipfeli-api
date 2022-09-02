import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Tour } from './tour.entity';

@Entity()
export class TourCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  iconName: string;

  @ManyToMany(() => Tour, (tour) => tour.categories)
  tours: Tour[];
}
