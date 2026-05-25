import { MigrationInterface, QueryRunner } from 'typeorm';

const SEED_WORK_TYPES = [
  'Кладка перегородок',
  'Монтаж опалубки',
  'Заливка бетона',
  'Армирование',
  'Штукатурка',
  'Покраска',
  'Укладка плитки',
];

export class InitSchemaAndSeed1748169600000 implements MigrationInterface {
  name = 'InitSchemaAndSeed1748169600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "work_type" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" character varying(255) NOT NULL UNIQUE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "journal_entry" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "performed_date" date NOT NULL,
        "work_type_id" uuid NOT NULL,
        "volume" numeric(14,3) NOT NULL,
        "volume_unit" character varying(32) NOT NULL,
        "executor_name" character varying(255) NOT NULL,
        CONSTRAINT "FK_journal_entry_work_type"
          FOREIGN KEY ("work_type_id") REFERENCES "work_type"("id")
          ON DELETE RESTRICT ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_journal_entry_performed_date" ON "journal_entry" ("performed_date")
    `);

    for (const name of SEED_WORK_TYPES) {
      await queryRunner.query(
        `INSERT INTO "work_type" ("name") VALUES ($1) ON CONFLICT ("name") DO NOTHING`,
        [name],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "journal_entry"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "work_type"`);
  }
}
