import s3Config from '@core/aws/s3/s3.config';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { S3 } from 'aws-sdk';
import { AwsSdkModule } from 'nest-aws-sdk';
import { MsClientModule } from 'src/core/modules/ms-client/ms-client.module';
import { S3Controller } from './s3.controller';
import { S3Service } from './s3.service';

@Module({
  imports: [
    AwsSdkModule.forFeatures([S3]),
    ConfigModule.forRoot({
      load: [s3Config],
    }),
    MsClientModule,
  ],
  controllers: [S3Controller],
  providers: [S3Service],
  exports: [S3Service],
})
export class S3Module {}
