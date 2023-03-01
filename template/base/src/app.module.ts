import { CommonModule } from "@core/common";
import { MongoModule } from "@core/mongo";
import { Module } from "@nestjs/common";
import { defaultEngine } from "./app.config";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { CoreModule } from "./core/core.module";

@Module({
  imports: [
    CoreModule,
    MongoModule.register({ seeder: true }),
    CommonModule.register({ defaultEngine })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
