import { MongoDocument } from '@core/mongo';
import { MongoSchema } from '@core/mongo/mongo.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString } from 'class-validator';

export type PageDocument = MongoDocument<Page>;

@Schema({
  collection: 'page',
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})
export class Page extends MongoSchema {
  @Prop({ unique: true })
  @ApiProperty({
    description: 'Page Name',
    example: 'about_us',
  })
  @IsString()
  name: string;

  @Prop()
  @ApiProperty({
    description: 'Page Title',
    example: 'About Us',
  })
  @IsString()
  title: string;

  @Prop()
  @ApiProperty({
    description: 'Page Content',
    example: 'About us sample content',
  })
  @IsString()
  content: string;

  @Prop({ default: true })
  @ApiProperty({
    description: 'Allow HTML Content?',
    example: true,
  })
  @IsBoolean()
  allow_html: boolean;
}
export const PageSchema = SchemaFactory.createForClass(Page);
