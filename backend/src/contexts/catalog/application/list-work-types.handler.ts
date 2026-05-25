import { Inject, Injectable } from '@nestjs/common';
import {
  WORK_TYPE_REPOSITORY,
  type WorkTypeRepository,
} from '../domain/work-type.repository.port';

/** Простой прикладной сценарий каталога: выдать виды работ. */
@Injectable()
export class ListWorkTypesHandler {
  constructor(
    @Inject(WORK_TYPE_REPOSITORY)
    private readonly workTypes: WorkTypeRepository,
  ) {}

  async execute(): Promise<{ id: string; name: string }[]> {
    const list = await this.workTypes.findAllOrderedByName();
    return list.map((wt) => wt.toPrimitives());
  }
}
