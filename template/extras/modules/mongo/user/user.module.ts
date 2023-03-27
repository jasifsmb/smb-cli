import { MongoModule } from '@core/mongo';
import { Module } from '@nestjs/common';
import config from 'src/config';
import { generateHash, uuid } from 'src/core/core.utils';
import { User, UserSchema } from './entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [
    MongoModule.registerAsync({
      name: User.name,
      imports: [],
      useFactory: () => {
        const schema = UserSchema;
        schema.pre<User>('save', async function (next) {
          if (this.password) {
            this.password = await generateHash(this.password);
          }
          if (this.first_name && this.last_name) {
            this.name = `${this.first_name} ${this.last_name}`;
          }
          if (!this.uid) {
            this.uid = uuid();
          }
          next();
        });
        schema.virtual('avatar_url').get(function () {
          return this.avatar ? config().cdnURL + this.avatar : '';
        });
        return schema;
      },
      inject: [],
    }),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
