import type { JournalEntryAggregate } from './journal-entry.aggregate';

export const JOURNAL_ENTRY_REPOSITORY = Symbol('JOURNAL_ENTRY_REPOSITORY');

export type JournalEntriesSortOrder = 'ASC' | 'DESC';

export interface JournalEntryListFilter {
  from?: string;
  to?: string;
  sortOrder: JournalEntriesSortOrder;
}

export interface JournalEntryRepository {
  findMany(filter: JournalEntryListFilter): Promise<JournalEntryAggregate[]>;
  findById(id: string): Promise<JournalEntryAggregate | null>;
  create(props: {
    performedDate: string;
    workTypeId: string;
    volume: string;
    volumeUnit: string;
    executorName: string;
  }): Promise<JournalEntryAggregate>;
  persistPatched(
    id: string,
    patch: Partial<{
      performedDate: string;
      workTypeId: string;
      volume: string;
      volumeUnit: string;
      executorName: string;
    }>,
  ): Promise<JournalEntryAggregate>;
  removeById(id: string): Promise<boolean>;
}
