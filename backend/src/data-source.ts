import 'reflect-metadata';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { join } from 'path';
import { JournalEntryOrmEntity } from './contexts/shared/persistence/schema/journal-entry.orm-entity';
import { WorkTypeOrmEntity } from './contexts/shared/persistence/schema/work-type.orm-entity';

config({ path: join(__dirname, '..', '.env') });

export default new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST ?? 'localhost',
  port: parseInt(process.env.DATABASE_PORT ?? '5432', 10),
  username: process.env.DATABASE_USER ?? 'postgres',
  password: process.env.DATABASE_PASSWORD ?? 'postgres',
  database: process.env.DATABASE_NAME ?? 'journal',
  entities: [WorkTypeOrmEntity, JournalEntryOrmEntity],
  migrations: [
    join(__dirname, 'migrations', '*.js'),
    join(__dirname, 'migrations', '*.ts'),
  ],
});
