import { User } from '@core/common/modules/sql/user/entities/user.entity';
import { SetMetadata } from '@nestjs/common';

export const OWNER_INCLUDE_ATTRIBUTES_KEY = 'owner_include_attributes';
export const OwnerIncludeAttribute = (...attributes: (keyof User)[]) =>
  SetMetadata(OWNER_INCLUDE_ATTRIBUTES_KEY, attributes);
