import { MongoDocument } from '@core/mongo';
import { MongoSchema } from '@core/mongo/mongo.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export type RoleDocument = MongoDocument<Role>;

@Schema({
  collection: 'roles',
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})
export class Role extends MongoSchema {
  @Prop()
  @ApiProperty({
    description: 'Role Name',
    example: 'Admin',
  })
  @IsString()
  name: string;
}
export const RoleSchema = SchemaFactory.createForClass(Role);
