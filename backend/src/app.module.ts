import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { CatalogModule } from './contexts/catalog/catalog.module';
import { JournalModule } from './contexts/journal/journal.module';
import { JournalEntryOrmEntity } from './contexts/shared/persistence/schema/journal-entry.orm-entity';
import { WorkTypeOrmEntity } from './contexts/shared/persistence/schema/work-type.orm-entity';
import { DddPersistenceModule } from './contexts/shared/persistence/ddd-persistence.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DATABASE_HOST', 'localhost'),
        port: parseInt(config.get<string>('DATABASE_PORT', '5432'), 10),
        username: config.get<string>('DATABASE_USER', 'postgres'),
        password: config.get<string>('DATABASE_PASSWORD', 'postgres'),
        database: config.get<string>('DATABASE_NAME', 'journal'),
        entities: [WorkTypeOrmEntity, JournalEntryOrmEntity],
        synchronize: false,
      }),
      inject: [ConfigService],
    }),
    DddPersistenceModule,
    CatalogModule,
    JournalModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
