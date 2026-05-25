import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JournalEntryAggregate } from '../../../journal/domain/journal-entry.aggregate';
import type {
  JournalEntryListFilter,
  JournalEntryRepository,
} from '../../../journal/domain/journal-entry.repository.port';
import { JournalEntryOrmEntity } from '../schema/journal-entry.orm-entity';

@Injectable()
export class TypeormJournalEntryRepository implements JournalEntryRepository {
  constructor(
    @InjectRepository(JournalEntryOrmEntity)
    private readonly repository: Repository<JournalEntryOrmEntity>,
  ) {}

  private coercePerformedDate(value: string | Date): string {
    if (value instanceof Date) {
      return value.toISOString().slice(0, 10);
    }
    return String(value).slice(0, 10);
  }

  private mapToAggregate(row: JournalEntryOrmEntity): JournalEntryAggregate {
    const snapshot = row.workType
      ? { id: String(row.workType.id), name: String(row.workType.name) }
      : null;
    return JournalEntryAggregate.reconstitute({
      id: String(row.id),
      performedDate: this.coercePerformedDate(row.performedDate),
      workTypeId: String(row.workTypeId),
      volume: String(row.volume),
      volumeUnit: row.volumeUnit,
      executorName: row.executorName,
      workTypeSnapshot: snapshot,
    });
  }

  async findMany(
    filter: JournalEntryListFilter,
  ): Promise<JournalEntryAggregate[]> {
    const qb = this.repository
      .createQueryBuilder('entry')
      .leftJoinAndSelect('entry.workType', 'workType')
      .orderBy('entry.performedDate', filter.sortOrder ?? 'DESC');

    if (filter.from) {
      qb.andWhere('entry.performedDate >= :from', { from: filter.from });
    }
    if (filter.to) {
      qb.andWhere('entry.performedDate <= :to', { to: filter.to });
    }

    const rows = await qb.getMany();
    return rows.map((r) => this.mapToAggregate(r));
  }

  async findById(id: string): Promise<JournalEntryAggregate | null> {
    const row = await this.repository.findOne({
      where: { id },
      relations: ['workType'],
    });
    return row ? this.mapToAggregate(row) : null;
  }

  async create(props: {
    performedDate: string;
    workTypeId: string;
    volume: string;
    volumeUnit: string;
    executorName: string;
  }): Promise<JournalEntryAggregate> {
    const draft = this.repository.create({
      performedDate: props.performedDate,
      workTypeId: props.workTypeId,
      volume: props.volume,
      volumeUnit: props.volumeUnit,
      executorName: props.executorName,
    });
    const saved = await this.repository.save(draft);
    const full = await this.findById(String(saved.id));
    if (!full) {
      throw new Error('Failed to reload journal entry after insert');
    }
    return full;
  }

  async persistPatched(
    id: string,
    patch: Partial<{
      performedDate: string;
      workTypeId: string;
      volume: string;
      volumeUnit: string;
      executorName: string;
    }>,
  ): Promise<JournalEntryAggregate> {
    const row = await this.repository.findOne({ where: { id } });
    if (!row) {
      throw new Error('Journal entry missing for persistPatched');
    }
    Object.assign(row, patch);
    await this.repository.save(row);
    const full = await this.findById(id);
    if (!full) {
      throw new Error('Failed to reload journal entry after update');
    }
    return full;
  }

  async removeById(id: string): Promise<boolean> {
    const result = await this.repository.delete({ id });
    return (result.affected ?? 0) > 0;
  }
}
