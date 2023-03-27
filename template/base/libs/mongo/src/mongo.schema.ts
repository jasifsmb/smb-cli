import { Prop, Schema } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';
import { SchemaTypes } from 'mongoose';
import { AppEngine, defaultEngine } from '../../../src/app.config';

@Schema()
export class MongoSchema {
  @ApiProperty({
    description: 'ID',
    example: '606d990740d3ba3480dae119',
    readOnly: true,
  })
  _id: string;

  @Prop({
    default: true,
  })
  @ApiProperty({
    description: 'Is Active?',
    example: true,
    required: false,
  })
  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  active: boolean;

  @ApiProperty({
    format: 'date-time',
    description: 'Created At',
    example: '2021-01-01T00:00:00Z',
    readOnly: true,
  })
  created_at: Date;

  @Prop({
    type: defaultEngine === AppEngine.Mongo ? SchemaTypes.ObjectId : Number,
    default: null,
  })
  @ApiProperty({
    description: 'Created By',
    example: '606d990740d3ba3480dae119',
    readOnly: true,
  })
  created_by: number | string;

  @ApiProperty({
    format: 'date-time',
    description: 'Updated At',
    example: '2021-01-01T00:00:00Z',
    readOnly: true,
  })
  updated_at: Date;

  @Prop({
    type: defaultEngine === AppEngine.Mongo ? SchemaTypes.ObjectId : Number,
    default: null,
  })
  @ApiProperty({
    description: 'Updated By',
    example: '606d990740d3ba3480dae119',
    readOnly: true,
  })
  updated_by: number | string;

  deletedAt: Date;

  deletedBy: number | string;
}
