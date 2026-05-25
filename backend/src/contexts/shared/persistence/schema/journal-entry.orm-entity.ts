import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { WorkTypeOrmEntity } from './work-type.orm-entity';

@Entity('journal_entry')
export class JournalEntryOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'date', name: 'performed_date' })
  performedDate!: string;

  @Column({ type: 'uuid', name: 'work_type_id' })
  workTypeId!: string;

  @ManyToOne(() => WorkTypeOrmEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'work_type_id' })
  workType!: WorkTypeOrmEntity;

  @Column({ type: 'decimal', precision: 14, scale: 3 })
  volume!: string;

  @Column({ type: 'varchar', length: 32, name: 'volume_unit' })
  volumeUnit!: string;

  @Column({ type: 'varchar', length: 255, name: 'executor_name' })
  executorName!: string;
}
