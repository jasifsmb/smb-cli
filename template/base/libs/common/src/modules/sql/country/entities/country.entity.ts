import { Entity } from '@core/sql/entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { Column, Index, Table } from 'sequelize-typescript';

@Table
export class Country extends Entity<Country> {
  @Column
  @Index
  @ApiProperty({
    description: 'Country name',
    example: 'United States',
  })
  @IsString()
  name: string;

  @Column
  @Index
  @ApiProperty({
    description: 'Country code',
    example: 'US',
  })
  @IsString()
  code: string;
}
