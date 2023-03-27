import sqsConfig from '@core/aws/sqs/sqs.config';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SQS } from 'aws-sdk';
import { AwsSdkModule } from 'nest-aws-sdk';
import { MsClientModule } from 'src/core/modules/ms-client/ms-client.module';
import { SQSController } from './sqs.controller';
import { SQSService } from './sqs.service';

@Module({
  imports: [
    AwsSdkModule.forFeatures([SQS]),
    ConfigModule.forRoot({
      load: [sqsConfig],
    }),
    MsClientModule,
  ],
  controllers: [SQSController],
  providers: [SQSService],
  exports: [SQSService],
})
export class SQSModule {}
