import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Tour } from '../../tour/entities/tour.entity';

@Entity()
export class GpxFile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  identifier: string;

  @Column()
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.gpxFiles, { onDelete: 'SET NULL' })
  user?: User | null;

  @OneToOne(() => Tour, (tour) => tour.gpxFile, { onDelete: 'SET NULL' })
  tour?: Tour | null;
}
