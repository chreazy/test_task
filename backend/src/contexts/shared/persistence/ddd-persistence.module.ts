import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WORK_TYPE_REPOSITORY } from '../../catalog/domain/work-type.repository.port';
import { JOURNAL_ENTRY_REPOSITORY } from '../../journal/domain/journal-entry.repository.port';
import { JournalEntryOrmEntity } from './schema/journal-entry.orm-entity';
import { WorkTypeOrmEntity } from './schema/work-type.orm-entity';
import { TypeormJournalEntryRepository } from './typeorm/typeorm-journal-entry.repository';
import { TypeormWorkTypeRepository } from './typeorm/typeorm-work-type.repository';

@Global()
/**
 * Инфраструктурный модуль слоя сохранности: регистрирует ORM-сущности и адаптеры репозиториев (порты домена).
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([WorkTypeOrmEntity, JournalEntryOrmEntity]),
  ],
  providers: [
    TypeormWorkTypeRepository,
    TypeormJournalEntryRepository,
    {
      provide: WORK_TYPE_REPOSITORY,
      useExisting: TypeormWorkTypeRepository,
    },
    {
      provide: JOURNAL_ENTRY_REPOSITORY,
      useExisting: TypeormJournalEntryRepository,
    },
  ],
  exports: [WORK_TYPE_REPOSITORY, JOURNAL_ENTRY_REPOSITORY],
})
export class DddPersistenceModule {}
