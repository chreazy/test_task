import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateJournalEntryDto {
  @ApiProperty({
    pattern: '^\\d{4}-\\d{2}-\\d{2}$',
    description: 'Дата выполнения работ',
    example: '2026-05-25',
  })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'performedDate must be YYYY-MM-DD',
  })
  performedDate!: string;

  @ApiProperty({
    format: 'uuid',
    description: 'Идентификатор вида работ из каталога (/api/work-types)',
  })
  @IsUUID('4')
  workTypeId!: string;

  @ApiProperty({
    minimum: 0,
    description: 'Объём выполненных работ',
    example: 24,
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  volume!: number;

  @ApiProperty({
    example: 'м³',
    description: 'Единица измерения объёма',
    maxLength: 32,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  volumeUnit!: string;

  @ApiProperty({
    description: 'ФИО исполнителя или бригадира',
    example: 'Иванов Иван Иванович',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  executorName!: string;
}
