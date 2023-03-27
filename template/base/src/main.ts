import * as compression from 'compression';
import { json, urlencoded } from 'express';
import helmet from 'helmet';
import * as morgan from 'morgan';
import { join } from 'path';

import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule } from '@nestjs/swagger';

import { isPrimaryInstance } from 'src/core/core.utils';
import { initAdapters } from './app.gateway';
import { AppModule } from './app.module';
import { SwaggerConfig, SwaggerOptions } from './config/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setGlobalPrefix('v1');
  /* Loading config */
  const config = app.get(ConfigService);
  const env = config.get('env');
  if (env !== 'production') {
    /* Morgan logger in non-production env */
    app.use(morgan('tiny'));
    /* Swagger documentation */
    /* Only available in non-production env */
    const document = SwaggerModule.createDocument(app, SwaggerConfig);
    SwaggerModule.setup('/docs', app, document, SwaggerOptions);
  }
  /* Body parsers */
  app.use(json({ limit: '5mb' }));
  app.use(urlencoded({ extended: true, limit: '5mb' }));
  /* Trust proxy config */
  app.set('trust proxy', 1);
  /* Helmet */
  app.use(helmet({ crossOriginResourcePolicy: false }));
  /* CORS */
  app.enableCors();
  /* Compression */
  app.use(compression());
  /* MVC setup */
  app.setBaseViewsDir(join(__dirname, 'views'));
  app.setViewEngine('hbs');
  if (isPrimaryInstance()) {
    /* Micro service setup */
    app.connectMicroservice<MicroserviceOptions>(config.get('ms'));
    await app.startAllMicroservices();
  }
  /* Init socket */
  if (config.get('useSocketIO')) {
    initAdapters(app);
  }
  /* Starting app */
  const port = config.get('port');
  await app.listen(port);
}
bootstrap();
