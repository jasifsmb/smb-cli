import { Entity } from '@core/sql/entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString } from 'class-validator';
import { DataTypes } from 'sequelize';
import { Column, Table } from 'sequelize-typescript';

@Table
export class Page extends Entity<Page> {
  @Column({ unique: 'name' })
  @ApiProperty({
    description: 'Page Name',
    example: 'about_us',
  })
  @IsString()
  name: string;

  @Column
  @ApiProperty({
    description: 'Page Title',
    example: 'About Us',
  })
  @IsString()
  title: string;

  @Column(DataTypes.TEXT({ length: 'long' }))
  @ApiProperty({
    description: 'Page Content',
    example: 'About us sample content',
  })
  @IsString()
  content: string;

  @Column({ defaultValue: true })
  @ApiProperty({
    description: 'Allow HTML Content?',
    example: true,
  })
  @IsBoolean()
  allow_html: boolean;
}
