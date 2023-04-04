import { MongoModule } from '@core/mongo';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppGateway } from './app.gateway';
import { AppService } from './app.service';
import { CoreModule } from './core/core.module';
import { CommonModule } from './modules/common.module';

@Module({
  imports: [
    CoreModule,
    MongoModule.root({ seeder: true }),
    CommonModule.register(),
  ],
  controllers: [AppController],
  providers: [AppService, AppGateway],
})
export class AppModule {}
