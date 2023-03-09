import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Template } from './entities/template.entity';
import { TemplateController } from './template.controller';
import { TemplateService } from './template.service';

@Module({
  imports: [SequelizeModule.forFeature([Template])],
  controllers: [TemplateController],
  providers: [TemplateService],
  exports: [TemplateService],
})
export class TemplateModule {}
