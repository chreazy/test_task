/** Агрегат «строка журнала» (bounded context: journal). Снимок вида работ — value, не агрегат каталога. */
export class JournalEntryAggregate {
  private constructor(
    readonly id: string,
    readonly performedDate: string,
    readonly workTypeId: string,
    readonly volume: string,
    readonly volumeUnit: string,
    readonly executorName: string,
    /** Снимок связанного справочника на момент чтения */
    readonly workTypeSnapshot: { id: string; name: string } | null,
  ) {}

  static reconstitute(props: {
    id: string;
    performedDate: string;
    workTypeId: string;
    volume: string;
    volumeUnit: string;
    executorName: string;
    workTypeSnapshot: { id: string; name: string } | null;
  }): JournalEntryAggregate {
    return new JournalEntryAggregate(
      props.id,
      props.performedDate,
      props.workTypeId,
      props.volume,
      props.volumeUnit,
      props.executorName,
      props.workTypeSnapshot,
    );
  }

  toResponse(): {
    id: string;
    performedDate: string;
    workTypeId: string;
    volume: string;
    volumeUnit: string;
    executorName: string;
    workType?: { id: string; name: string };
  } {
    const base = {
      id: this.id,
      performedDate: this.performedDate,
      workTypeId: this.workTypeId,
      volume: this.volume,
      volumeUnit: this.volumeUnit,
      executorName: this.executorName,
    };
    if (!this.workTypeSnapshot) {
      return base;
    }
    return {
      ...base,
      workType: this.workTypeSnapshot,
    };
  }
}
