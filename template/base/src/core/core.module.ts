import { CacheModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  ServeStaticModule,
  ServeStaticModuleOptions,
} from '@nestjs/serve-static';
import { ThrottlerModule } from '@nestjs/throttler/dist/throttler.module';
import { existsSync, mkdirSync } from 'fs';
import config from '../config';
import { SessionModule } from './modules/session/session.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [config],
    }),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => config.get('cache'),
    }),
    SessionModule,
    ServeStaticModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const cdnStatic = config.get('cdnStatic');
        const cdnPath = config.get('cdnPath');
        const cdnServeRoot = config.get('cdnServeRoot');
        const paths: ServeStaticModuleOptions[] = [];
        if (cdnStatic) {
          existsSync(cdnPath) || mkdirSync(cdnPath);
          paths.push({
            rootPath: cdnPath,
            serveRoot: cdnServeRoot,
          });
        }
        return paths;
      },
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => config.get('throttler'),
    }),
  ],
  exports: [ConfigModule, CacheModule, ServeStaticModule, ThrottlerModule],
})
export class CoreModule {}
