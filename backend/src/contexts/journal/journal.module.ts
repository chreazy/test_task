import { Module } from '@nestjs/common';
import { JournalApplicationService } from './application/journal.application.service';
import { JournalEntriesHttpController } from './presentation/http/journal-entries.controller';

/** Bounded context: журнал выполненных работ на объекте. */
@Module({
  controllers: [JournalEntriesHttpController],
  providers: [JournalApplicationService],
})
export class JournalModule {}
