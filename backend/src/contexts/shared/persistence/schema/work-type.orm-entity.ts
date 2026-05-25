import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Persistence model для work_type (без inverse OneToMany, чтобы не плодить циклических импортов).
 */
@Entity('work_type')
export class WorkTypeOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  name!: string;
}
