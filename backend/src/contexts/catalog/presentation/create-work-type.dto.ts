import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateWorkTypeDto {
  @ApiProperty({
    example: 'Резка проёмов под вентиляционные шахты',
    description: 'Текст попадёт в справочник; дубликаты по точному совпадению отклоняются',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;
}
