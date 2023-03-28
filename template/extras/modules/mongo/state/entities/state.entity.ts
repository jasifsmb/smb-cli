import { MongoDocument } from '@core/mongo';
import { MongoSchema } from '@core/mongo/mongo.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { IsMongoId, IsString } from 'class-validator';
import { SchemaTypes } from 'mongoose';
import { Country } from '../../country/entities/country.entity';

export type StateDocument = MongoDocument<State>;

@Schema({
  collection: 'states',
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
  toJSON: { virtuals: true },
})
export class State extends MongoSchema {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'Country' })
  @ApiProperty({
    description: 'Country',
    example: '60f6c774b735412058402be7',
    anyOf: [{ type: 'string' }, { $ref: getSchemaPath(Country) }],
  })
  @IsMongoId()
  country_id: string | Country;

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
