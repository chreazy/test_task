import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Системное')
@Controller()
export class AppController {
  @Get()
  @ApiOperation({ summary: 'Корень API (список путей)' })
  @ApiOkResponse({
    description: 'Сервис, ссылки на swagger и массив эндпоинтов',
    schema: {
      example: {
        ok: true,
        service: 'journal-api',
        endpoints: [
          {
            method: 'GET',
            path: '/api/work-types',
            description: 'Справочник видов работ',
          },
        ],
      },
    },
  })
  getApiRoot() {
    return {
      ok: true,
      service: 'journal-api',
      swaggerUi: '/api/docs',
      openApiJson: '/api/docs-json',
      endpoints: [
        {
          method: 'GET',
          path: '/api/work-types',
          description: 'Справочник видов работ',
        },
        {
          method: 'POST',
          path: '/api/work-types',
          description: 'Добавить вид работ',
        },
        {
          method: 'GET',
          path: '/api/journal-entries',
          description: 'Журнал (query: from, to, sortOrder)',
        },
        {
          method: 'POST',
          path: '/api/journal-entries',
          description: 'Новая запись',
        },
        {
          method: 'PATCH',
          path: '/api/journal-entries/:id',
          description: 'Обновление записи',
        },
        {
          method: 'DELETE',
          path: '/api/journal-entries/:id',
          description: 'Удаление записи',
        },
      ],
    };
  }
}
