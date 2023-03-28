import { MongoDocument } from '@core/mongo';
import { MongoSchema } from '@core/mongo/mongo.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type OtpSessionDocument = MongoDocument<OtpSession>;

@Schema({
  collection: 'otp_sessions',
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})
export class OtpSession extends MongoSchema {
  @Prop({ type: 'Mixed' })
  @ApiProperty({
    description: 'User ID',
    example: 1,
  })
  user_id: any;

  @Prop()
  @ApiProperty({
    description: 'OTP',
    example: '123456',
  })
  otp: string;

  @Prop()
  @ApiProperty({
    description: 'Type',
    example: 'Forgot',
  })
  type: 'Forgot' | 'Signup' | 'Login';

  @Prop({
    default: false,
  })
  @ApiProperty({
    description: 'Verified?',
    example: false,
  })
  verified: boolean;

  @Prop({
    default: 3,
  })
  @ApiProperty({
    description: 'Retry Limit',
    example: 3,
  })
  retry_limit: number;

  @Prop({
    default: 2,
  })
  @ApiProperty({
    description: 'Resend Limit',
    example: 2,
  })
  resend_limit: number;

  @Prop()
  @ApiProperty({
    format: 'date-time',
    description: 'Expire At',
    example: '2021-01-01T00:00:00Z',
  })
  expire_at: Date;

  @Prop({ type: 'Mixed' })
  @ApiProperty({
    type: {},
    description: 'Other Infos',
  })
  payload: any;
}

export const OtpSessionSchema = SchemaFactory.createForClass(OtpSession);
