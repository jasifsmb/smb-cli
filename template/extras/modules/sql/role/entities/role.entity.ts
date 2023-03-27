import { SqlModel } from '@core/sql/sql.model';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { Column, Table } from 'sequelize-typescript';

@Table
export class Role extends SqlModel {
  @Column
  @ApiProperty({
    description: 'Role Name',
    example: 'Admin',
  })
  @IsString()
  name: string;
}
