import { Entity } from '@core/mongo/entity';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { Document } from 'mongoose';
export type RoleDocument = Role & Document;

@Schema({
  collection: 'roles',
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})
export class Role extends Entity {
  @Prop()
  @ApiProperty({
    description: 'Role Name',
    example: 'Admin',
  })
  @IsString()
  name: string;
}
export const RoleSchema = SchemaFactory.createForClass(Role);
