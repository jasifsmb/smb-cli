import { Entity } from '@core/mongo/entity';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsInt,
  IsNumberString,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import mongoose, { Document } from 'mongoose';
import { AuthProvider } from '../../auth/auth-provider.enum';
import { Role } from '../../role/entities/role.entity';
export type UserDocument = User & Document;

@Schema({
  collection: 'users',
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})
export class User extends Entity {
  @ApiProperty({
    description: 'User ID',
    example: 1,
    readOnly: true,
  })
  id: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Role' })
  @ApiProperty({
    description: 'Role ID',
    example: 1,
  })
  @IsInt()
  role_id: Role;

  @Prop({ unique: true })
  @ApiProperty({
    description: 'Unique ID',
    example: 'a926d382-6741-4d95-86cf-1f5c421cf654',
    readOnly: true,
  })
  uid: string;

  @Prop({
    type: String,
    enum: Object.values(AuthProvider),
    default: 'Local',
  })
  @ApiProperty({
    enum: AuthProvider,
    description: 'Auth Provider',
    example: 'Local',
    readOnly: true,
  })
  provider: AuthProvider;

  @Prop()
  @ApiProperty({
    description: 'Google ID',
    example: 'a926d382-6741-4d95-86cf-1f5c421cf654',
    readOnly: true,
  })
  google_id?: string;

  @Prop()
  @ApiProperty({
    description: 'Facebook ID',
    example: 'a926d382-6741-4d95-86cf-1f5c421cf654',
    readOnly: true,
  })
  facebook_id?: string;

  @Prop()
  @ApiProperty({
    description: 'Firebase ID',
    example: 'a926d382-6741-4d95-86cf-1f5c421cf654',
    readOnly: true,
  })
  firebase_id?: string;

  @Prop()
  @ApiProperty({
    description: 'Apple ID',
    example: 'a926d382-6741-4d95-86cf-1f5c421cf654',
    readOnly: true,
  })
  apple_id?: string;

  @Prop()
  @ApiProperty({
    description: 'First Name',
    example: 'Ross',
  })
  @IsString()
  first_name: string;

  @Prop()
  @ApiProperty({
    description: 'Last Name',
    example: 'Geller',
  })
  @IsString()
  last_name: string;

  @Prop()
  @ApiProperty({
    description: 'Full Name',
    example: 'Ross Geller',
    readOnly: true,
  })
  name?: string;

  @Prop()
  @ApiProperty({
    description: 'Email',
    example: 'ross.geller@gmail.com',
  })
  @IsString()
  @IsEmail()
  email: string;

  @Prop({ type: String, default: '+1' })
  @ApiProperty({
    description: 'Phone Code',
    example: '+91',
  })
  @IsString()
  phone_code: string;

  @Prop({ type: String })
  @ApiProperty({
    description: 'Phone',
    example: '9999999999',
  })
  @IsNumberString()
  phone: string;

  @Prop()
  @ApiProperty({
    description: 'Password',
    example: '123456',
    writeOnly: true,
  })
  @IsString()
  @MinLength(6)
  password: string;

  @Prop()
  @ApiProperty({
    description: 'Avatar',
    example: 'user/avatar.png',
  })
  @IsOptional()
  @IsString()
  avatar: string;

  @Prop({ default: false })
  @ApiProperty({
    description: 'Enable 2FA?',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  enable_2fa?: boolean;

  @Prop({ default: true })
  @ApiProperty({
    description: 'Send Email?',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  send_email?: boolean;

  @Prop({ default: true })
  @ApiProperty({
    description: 'Send SMS?',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  send_sms?: boolean;

  @Prop({ default: true })
  @ApiProperty({
    description: 'Send Push?',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  send_push?: boolean;

  @Prop()
  @ApiProperty({
    format: 'date-time',
    description: 'Last Login At',
    example: '2021-01-01T00:00:00Z',
    readOnly: true,
  })
  last_login_at?: Date;
}
export const UserSchema = SchemaFactory.createForClass(User);
