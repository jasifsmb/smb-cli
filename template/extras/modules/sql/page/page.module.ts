import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule } from '@nestjs/config';
import { PageService } from './page.service';
import { PageController } from './page.controller';
import { Page } from './entities/page.entity';

@Module({
  imports: [SequelizeModule.forFeature([Page]), ConfigModule],
  controllers: [PageController],
  providers: [PageService],
})
export class PageModule {}
