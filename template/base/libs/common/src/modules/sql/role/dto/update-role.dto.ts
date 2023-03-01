import { OmitType } from '@nestjs/swagger';
import { Role } from '../entities/role.entity';

export class UpdateRoleDto extends OmitType(Role, [] as const) {}
