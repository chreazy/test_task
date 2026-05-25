import {
  ConflictException,
  Inject,
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import {
  WORK_TYPE_REPOSITORY,
  type WorkTypeRepository,
} from '../domain/work-type.repository.port';

/** Добавить вид работ в справочник (например, «своё название» с фронта). */
@Injectable()
export class CreateWorkTypeHandler {
  constructor(
    @Inject(WORK_TYPE_REPOSITORY)
    private readonly workTypes: WorkTypeRepository,
  ) {}

  async execute(body: { name: string }): Promise<{ id: string; name: string }> {
    const name = body.name.trim();
    if (!name) {
      throw new BadRequestException('Укажите наименование вида работ');
    }
    if (name.length > 255) {
      throw new BadRequestException('Наименование не длиннее 255 символов');
    }
    const dup = await this.workTypes.findOneByName(name);
    if (dup) {
      throw new ConflictException(
        'Вид работ с таким наименованием уже есть в справочнике',
      );
    }
    const created = await this.workTypes.create({ name });
    return created.toPrimitives();
  }
}
