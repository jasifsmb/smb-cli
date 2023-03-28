import { MongoModule } from '@core/mongo';
import { Module } from '@nestjs/common';
import { Role, RoleSchema } from './entities/role.entity';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';

@Module({
  imports: [MongoModule.register({ name: Role.name, schema: RoleSchema })],
  controllers: [RoleController],
  providers: [RoleService],
  exports: [RoleService],
})
export class RoleModule {}
