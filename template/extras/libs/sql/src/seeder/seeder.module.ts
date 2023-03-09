import { Module, OnModuleInit } from '@nestjs/common';
import { isPrimaryInstance } from 'src/core/core.utils';
import { DatabaseModule } from '../database/database.module';
import { SeederService } from './seeder.service';

@Module({
  imports: [DatabaseModule],
  providers: [SeederService],
  exports: [SeederService],
})
export class SeederModule implements OnModuleInit {
  constructor(private _seeder: SeederService) {}
  onModuleInit() {
    if (isPrimaryInstance()) {
      // seeding
      this._seeder.seed();
    }
  }
}
