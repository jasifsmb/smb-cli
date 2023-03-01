import { User } from '@core/common/modules/sql/user/entities/user.entity';
import { SetMetadata } from '@nestjs/common';

export const OWNER_INCLUDE_POPULATES_KEY = 'owner_include_populates';
export const OwnerIncludePopulate = (...populates: (keyof User)[]) =>
  SetMetadata(OWNER_INCLUDE_POPULATES_KEY, populates);
