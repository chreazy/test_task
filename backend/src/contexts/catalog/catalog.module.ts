import { Module } from '@nestjs/common';
import { CreateWorkTypeHandler } from './application/create-work-type.handler';
import { ListWorkTypesHandler } from './application/list-work-types.handler';
import { WorkTypesHttpController } from './presentation/work-types.controller';

/** Bounded context: справочник видов работ. */
@Module({
  controllers: [WorkTypesHttpController],
  providers: [ListWorkTypesHandler, CreateWorkTypeHandler],
})
export class CatalogModule {}
