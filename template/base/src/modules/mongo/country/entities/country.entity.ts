import { Entity } from '@core/mongo/entity';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { Document } from 'mongoose';
export type CountryDocument = Country & Document;

@Schema({
  collection: 'country',
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})
export class Country extends Entity {
  @Prop()
  @ApiProperty({
    description: 'Country Name',
    example: 'United States',
  })
  @IsString()
  name: string;

  @Prop()
  @ApiProperty({
    description: 'Country Code',
    example: 'US',
  })
  @IsString()
  code: string;
}
export const CountrySchema = SchemaFactory.createForClass(Country);
