import { Entity } from '@core/mongo/entity';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive, IsString } from 'class-validator';
import mongoose, { Document } from 'mongoose';
export type StateDocument = State & Document;

@Schema({
  collection: 'states',
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})
export class State extends Entity {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Country' })
  @ApiProperty({
    description: 'Country ID',
    example: 1,
  })
  @IsInt()
  @IsPositive()
  country_id: number;

  @Prop()
  @ApiProperty({
    description: 'State Name',
    example: 'Alabama',
  })
  @IsString()
  name: string;

  @Prop()
  @ApiProperty({
    description: 'State Code',
    example: 'AL',
  })
  @IsString()
  code: string;
}
export const StateSchema = SchemaFactory.createForClass(State);
