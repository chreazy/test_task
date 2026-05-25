import type { WorkTypeAggregate } from './work-type.aggregate';

export const WORK_TYPE_REPOSITORY = Symbol('WORK_TYPE_REPOSITORY');

export interface WorkTypeRepository {
  findAllOrderedByName(): Promise<WorkTypeAggregate[]>;
  existsById(id: string): Promise<boolean>;
  findOneByName(name: string): Promise<WorkTypeAggregate | null>;
  create(params: { name: string }): Promise<WorkTypeAggregate>;
}
