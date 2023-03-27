import { DynamicModule, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { QueryGuard } from 'src/core/guards/query.guard';
import { HistoryModule } from './mongo/history/history.module';
import { LoginLogModule } from './mongo/login-log/login-log.module';
import { OtpSessionModule } from './mongo/otp-session/otp-session.module';
import { TaskModule } from './mongo/task/task.module';
import { TrashModule } from './mongo/trash/trash.module';

@Module({})
export class CommonModule {
  static register(): DynamicModule {
    // common imports
    const modules = [
      TaskModule,
      HistoryModule,
      TrashModule,
      LoginLogModule,
      OtpSessionModule,
    ];

    // common providers
    const providers: any = [
      {
        provide: APP_GUARD,
        useClass: QueryGuard,
      },
    ];

    return {
      module: CommonModule,
      imports: modules,
      providers,
    };
  }
}
