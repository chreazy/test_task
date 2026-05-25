import { Body, Controller, Get, Post } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiConflictResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateWorkTypeHandler } from '../application/create-work-type.handler';
import { ListWorkTypesHandler } from '../application/list-work-types.handler';
import { CreateWorkTypeDto } from './create-work-type.dto';

@ApiTags('Каталог')
@Controller('work-types')
export class WorkTypesHttpController {
  constructor(
    private readonly listWorkTypes: ListWorkTypesHandler,
    private readonly createWorkType: CreateWorkTypeHandler,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Список видов работ' })
  @ApiOkResponse({
    description:
      'Массив справочных позиций, отсортированных по наименованию (берёт UUID из базы после сидирования)',
    schema: {
      example: [
        {
          id: '00000000-0000-4000-a000-000000000001',
          name: 'Монтаж опалубки',
        },
      ],
    },
  })
  async list() {
    return this.listWorkTypes.execute();
  }

  @Post()
  @ApiOperation({ summary: 'Добавить вид работ в справочник' })
  @ApiCreatedResponse({
    description: 'Созданная позиция с UUID из БД',
    schema: {
      example: {
        id: '00000000-0000-4000-a000-000000000099',
        name: 'Индивидуальное наименование',
      },
    },
  })
  @ApiConflictResponse({
    description: 'Точное совпадение наименования с уже существующим',
  })
  async create(@Body() dto: CreateWorkTypeDto) {
    return this.createWorkType.execute({ name: dto.name });
  }
}
