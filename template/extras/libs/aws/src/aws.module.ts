import awsConfig from '@core/aws/aws.config';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AwsSdkModule } from 'nest-aws-sdk';

@Module({
  imports: [
    AwsSdkModule.forRootAsync({
      defaultServiceOptions: {
        imports: [
          ConfigModule.forRoot({
            load: [awsConfig],
          }),
        ],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => configService.get('aws'),
      },
      services: [],
    }),
  ],
  providers: [],
})
export class AwsModule {}
