import { Entity } from '@core/sql/entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { Column, Table } from 'sequelize-typescript';

@Table
export class Role extends Entity<Role> {
  @Column
  @ApiProperty({
    description: 'Role Name',
    example: 'Admin',
  })
  @IsString()
  name: string;
}
