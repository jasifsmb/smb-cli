import { MongoDocument } from '@core/mongo';
import { MongoSchema } from '@core/mongo/mongo.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export type CountryDocument = MongoDocument<Country>;

@Schema({
  collection: 'country',
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})
export class Country extends MongoSchema {
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
