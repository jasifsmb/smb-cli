import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { State } from './entities/state.entity';
import { StateController } from './state.controller';
import { StateService } from './state.service';

@Module({
  imports: [SequelizeModule.forFeature([State])],
  controllers: [StateController],
  providers: [StateService],
})
export class StateModule {}
