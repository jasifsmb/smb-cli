import { Entity } from '@core/mongo/entity';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString } from 'class-validator';
import { Document } from 'mongoose';
export type TemplateDocument = Template & Document;

@Schema({
  collection: 'template',
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})
export class Template extends Entity {
  @Prop({ unique: true })
  @ApiProperty({
    description: 'Template Name',
    example: 'new_account',
  })
  @IsString()
  name: string;

  @Prop()
  @ApiProperty({
    description: 'Template Title',
    example: 'New Account',
  })
  @IsString()
  title: string;

  @Prop({ default: true })
  @ApiProperty({
    description: 'Send Email?',
    example: true,
  })
  @IsBoolean()
  send_email: boolean;

  @Prop()
  @ApiProperty({
    description: 'Email Subject',
    example: 'New account created',
  })
  @IsString()
  email_subject: string;

  @Prop()
  @ApiProperty({
    description: 'Email Body',
    example: '<p>HTML content</p>',
  })
  @IsString()
  email_body: string;

  @Prop({ default: true })
  @ApiProperty({
    description: 'Send SMS?',
    example: true,
  })
  @IsBoolean()
  send_sms: boolean;

  @Prop()
  @ApiProperty({
    description: 'SMS Body',
    example: 'SMS content',
  })
  @IsString()
  sms_body: string;
}
export const RoleSchema = SchemaFactory.createForClass(Template);
