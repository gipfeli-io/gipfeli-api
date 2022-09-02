import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Tour } from '../../tour/entities/tour.entity';
import { Point } from 'geojson';

@Entity()
export class Image {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  identifier: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  userId: string | null;

  @ManyToOne(() => User, (user) => user.images, { onDelete: 'SET NULL' })
  user?: User | null;

  @Column({ nullable: true })
  tourId: string | null;

  @ManyToOne(() => Tour, (tour) => tour.images, { onDelete: 'SET NULL' })
  tour?: Tour | null;

  @Index({ spatial: true })
  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  location: Point | null;
}
