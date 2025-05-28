import { OrganizationMember } from './organization-member'
import { Organization } from './organization.entity'
import { Permission, RolePermission } from './permission.entity'
import { RefreshToken } from './refresh-token.entity'
import { Role } from './role.entity'
import { UserRole } from './user-roles.entity'
import { User } from './user.entity'

export const ENTITIES = [Organization, User, Role, UserRole, Permission, RolePermission, RefreshToken, OrganizationMember]