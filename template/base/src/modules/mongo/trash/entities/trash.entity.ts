import { MongoDocument } from '@core/mongo';
import { MongoSchema } from '@core/mongo/mongo.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type TrashDocument = MongoDocument<Trash>;

@Schema({
  collection: 'trashes',
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})
export class Trash extends MongoSchema {
  @Prop()
  @ApiProperty({
    description: 'Entity Name',
    example: 'User',
  })
  entity: string;

  @Prop()
  @ApiProperty({
    description: 'Entity ID',
    example: 1,
  })
  entity_id: number;

  @Prop()
  @ApiProperty({
    description: 'Action',
    example: 1,
  })
  action: string;

  @Prop({ type: 'Mixed' })
  @ApiProperty({
    type: {},
    description: 'New Details',
  })
  data: any;

  @Prop({ type: 'date' })
  @ApiProperty({
    format: 'date-time',
    description: 'Expire Date',
    example: '2021-01-01T00:00:00Z',
  })
  expire_in: Date;
}

export const TrashSchema = SchemaFactory.createForClass(Trash);
