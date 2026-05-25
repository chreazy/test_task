import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import type { JournalEntryListFilter } from '../../domain/journal-entry.repository.port';
import { JournalApplicationService } from '../../application/journal.application.service';
import { CreateJournalEntryDto } from './dto/create-journal-entry.dto';
import { QueryJournalEntriesDto } from './dto/query-journal-entries.dto';
import { UpdateJournalEntryDto } from './dto/update-journal-entry.dto';

@ApiTags('Журнал')
@Controller('journal-entries')
export class JournalEntriesHttpController {
  constructor(private readonly journalApplication: JournalApplicationService) {}

  private toFilter(query: QueryJournalEntriesDto): JournalEntryListFilter {
    return {
      from: query.from,
      to: query.to,
      sortOrder: query.sortOrder,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Список записей журнала' })
  @ApiQuery({
    name: 'from',
    required: false,
    example: '2024-06-01',
    description: 'Нижняя граница даты выполнения (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'to',
    required: false,
    example: '2024-06-30',
    description: 'Верхняя граница даты выполнения (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'sortOrder',
    enum: ['ASC', 'DESC'],
    required: false,
    description: 'Сортировка по дате (по умолчанию DESC)',
  })
  async list(@Query() query: QueryJournalEntriesDto) {
    return this.journalApplication.list(this.toFilter(query));
  }

  @Post()
  @ApiOperation({ summary: 'Создать запись' })
  @ApiBody({ type: CreateJournalEntryDto })
  async create(@Body() dto: CreateJournalEntryDto) {
    return this.journalApplication.create(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить одну запись' })
  @ApiParam({ name: 'id', format: 'uuid' })
  async one(@Param('id', ParseUUIDPipe) id: string) {
    return this.journalApplication.getById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Частично обновить запись' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiBody({ type: UpdateJournalEntryDto })
  async patch(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateJournalEntryDto,
  ) {
    return this.journalApplication.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Удалить запись' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({
    schema: { example: { ok: true } },
    description: 'Удаление успешно',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.journalApplication.remove(id);
    return { ok: true };
  }
}
