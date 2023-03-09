import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import config from 'src/config';
import { generateHash, uuid } from 'src/core/core.utils';
import { Role, RoleSchema } from '../role/entities/role.entity';
import { User, UserSchema } from './entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Role.name,
        imports: [],
        useFactory: () => {
          const schema = RoleSchema;
          schema.virtual('id').get(function () {
            return this._id;
          });
          schema.virtual('role', {
            ref: 'Role',
            localField: '_id',
            foreignField: 'role_id',
            justOne: true,
            match: { deleted_at: null },
          });
          return schema;
        },
        inject: [],
      },
      {
        name: User.name,
        imports: [],
        useFactory: () => {
          const schema = UserSchema;
          schema.pre<User>('save', async function (next) {
            if (this.password) {
              this.password = await generateHash(this.password);
            }
            if (!!this.first_name && !!this.last_name) {
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
      },
    ]),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
