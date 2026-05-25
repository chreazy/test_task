import {
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import type {
  JournalEntryListFilter,
  JournalEntryRepository,
} from '../domain/journal-entry.repository.port';
import { JOURNAL_ENTRY_REPOSITORY } from '../domain/journal-entry.repository.port';
import type { WorkTypeRepository } from '../../catalog/domain/work-type.repository.port';
import { WORK_TYPE_REPOSITORY } from '../../catalog/domain/work-type.repository.port';
import { CreateJournalEntryDto } from '../presentation/http/dto/create-journal-entry.dto';
import { UpdateJournalEntryDto } from '../presentation/http/dto/update-journal-entry.dto';

/** Прикладной сервис контекста «журнал»: оркестрация репозиториев и инвариантов. */
@Injectable()
export class JournalApplicationService {
  constructor(
    @Inject(JOURNAL_ENTRY_REPOSITORY)
    private readonly entries: JournalEntryRepository,
    @Inject(WORK_TYPE_REPOSITORY)
    private readonly catalog: WorkTypeRepository,
  ) {}

  private async ensureCatalogRef(workTypeId: string): Promise<void> {
    const ok = await this.catalog.existsById(workTypeId);
    if (!ok) {
      throw new UnprocessableEntityException('Вид работ не найден');
    }
  }

  async list(filter: JournalEntryListFilter) {
    const agg = await this.entries.findMany(filter);
    return agg.map((row) => row.toResponse());
  }

  async getById(id: string) {
    const row = await this.entries.findById(id);
    if (!row) {
      throw new NotFoundException('Запись не найдена');
    }
    return row.toResponse();
  }

  async create(dto: CreateJournalEntryDto) {
    await this.ensureCatalogRef(dto.workTypeId);
    const saved = await this.entries.create({
      performedDate: dto.performedDate,
      workTypeId: dto.workTypeId,
      volume: dto.volume.toFixed(3),
      volumeUnit: dto.volumeUnit.trim(),
      executorName: dto.executorName.trim(),
    });
    return saved.toResponse();
  }

  async update(id: string, dto: UpdateJournalEntryDto) {
    const current = await this.entries.findById(id);
    if (!current) {
      throw new NotFoundException('Запись не найдена');
    }
    if (dto.workTypeId !== undefined) {
      await this.ensureCatalogRef(dto.workTypeId);
    }

    const patch: Parameters<JournalEntryRepository['persistPatched']>[1] = {};
    if (dto.performedDate !== undefined) {
      patch.performedDate = dto.performedDate;
    }
    if (dto.workTypeId !== undefined) {
      patch.workTypeId = dto.workTypeId;
    }
    if (dto.volume !== undefined) {
      patch.volume = dto.volume.toFixed(3);
    }
    if (dto.volumeUnit !== undefined) {
      patch.volumeUnit = dto.volumeUnit.trim();
    }
    if (dto.executorName !== undefined) {
      patch.executorName = dto.executorName.trim();
    }

    const updated = await this.entries.persistPatched(id, patch);
    return updated.toResponse();
  }

  async remove(id: string): Promise<void> {
    const ok = await this.entries.removeById(id);
    if (!ok) {
      throw new NotFoundException('Запись не найдена');
    }
  }
}
