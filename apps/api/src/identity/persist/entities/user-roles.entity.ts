import { DefaultEntity } from '@src/shared/lib/persistence/typeorm/entity/default.entity'
import { User } from './user.entity'
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm'
import { Organization } from './organization.entity'

export enum UserRoleType {
  ADMIN = 'admin',
  MEMBER = 'member',
  GUEST = 'guest',
}

@Entity({ name: 'user_roles' })
export class UserRole extends DefaultEntity<UserRole> {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  userId: string

  @Column({ type: 'enum', enum: UserRoleType, default: UserRoleType.MEMBER })
  role: UserRoleType;

  @PrimaryColumn({ type: 'uuid', name: 'organization_id' }) // The ID of the Organization
  organizationId: string;

  @ManyToOne(() => Organization, (organization) => organization.userRoles, { onDelete: 'CASCADE' })
  organization: Organization;

  @ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User

  @Column()
  roleId: string
}
