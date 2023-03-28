import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TwilioModule as NestTwilioModule } from 'nestjs-twilio';
import { MsClientModule } from 'src/core/modules/ms-client/ms-client.module';
import twilioConfig from './twilio.config';
import { TwilioController } from './twilio.controller';
import { TwilioService } from './twilio.service';

@Module({
  imports: [
    ConfigModule,
    NestTwilioModule.forRootAsync({
      imports: [
        ConfigModule.forRoot({
          load: [twilioConfig],
        }),
      ],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => config.get('twilio'),
    }),
    MsClientModule,
  ],
  controllers: [TwilioController],
  providers: [TwilioService],
  exports: [NestTwilioModule],
})
export class TwilioModule {}
