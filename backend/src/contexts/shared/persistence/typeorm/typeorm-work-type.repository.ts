import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkTypeAggregate } from '../../../catalog/domain/work-type.aggregate';
import type { WorkTypeRepository } from '../../../catalog/domain/work-type.repository.port';
import { WorkTypeOrmEntity } from '../schema/work-type.orm-entity';

@Injectable()
export class TypeormWorkTypeRepository implements WorkTypeRepository {
  constructor(
    @InjectRepository(WorkTypeOrmEntity)
    private readonly repository: Repository<WorkTypeOrmEntity>,
  ) {}

  async findAllOrderedByName(): Promise<WorkTypeAggregate[]> {
    const rows = await this.repository.find({ order: { name: 'ASC' } });
    return rows.map((r) =>
      WorkTypeAggregate.reconstitute(String(r.id), String(r.name)),
    );
  }

  existsById(id: string): Promise<boolean> {
    return this.repository.exist({ where: { id } });
  }

  async findOneByName(name: string): Promise<WorkTypeAggregate | null> {
    const row = await this.repository.findOne({ where: { name } });
    return row
      ? WorkTypeAggregate.reconstitute(String(row.id), String(row.name))
      : null;
  }

  async create(params: { name: string }): Promise<WorkTypeAggregate> {
    const draft = this.repository.create({ name: params.name });
    const saved = await this.repository.save(draft);
    return WorkTypeAggregate.reconstitute(String(saved.id), String(saved.name));
  }
}
