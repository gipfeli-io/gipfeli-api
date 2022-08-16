import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Point } from 'geojson';
import { User } from '../../user/entities/user.entity';
import { Image } from '../../media/entities/image.entity';
import { GpxFile } from '../../media/entities/gpx-file.entity';

@Entity()
export class Tour {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Index({ spatial: true })
  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  startLocation: Point;

  @Index({ spatial: true })
  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  endLocation: Point;

  @Column({ type: 'text' })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.tours, {
    onDelete: 'CASCADE',
  })
  user: User;

  @Column()
  userId: string;

  @OneToMany(() => Image, (image) => image.tour, {
    cascade: true,
    onDelete: 'SET NULL',
  })
  images: Image[];

  @OneToOne(() => GpxFile, (gpxFile) => gpxFile.tour, {
    cascade: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn()
  gpxFile: GpxFile;
}
