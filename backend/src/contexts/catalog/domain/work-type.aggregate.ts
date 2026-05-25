/** Агрегат справочника «вид работ» (bounded context: catalog). */
export class WorkTypeAggregate {
  private constructor(
    readonly id: string,
    readonly name: string,
  ) {}

  static reconstitute(id: string, name: string): WorkTypeAggregate {
    return new WorkTypeAggregate(id, name);
  }

  toPrimitives(): { id: string; name: string } {
    return { id: this.id, name: this.name };
  }
}
