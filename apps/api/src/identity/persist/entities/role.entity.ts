import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm'
import { DefaultEntity } from '@src/shared/lib/persistence/entity/default.entity'
import { RolePermission } from './permission.entity'
import { UserRole } from './user-roles.entity'

@Entity({ name: 'roles' })
export class Role extends DefaultEntity<Role> {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ unique: true, length: 50 })
  name: string

  @Column({ type: 'text', nullable: true })
  description?: string

  @OneToMany(() => UserRole, (userRole) => userRole.role)
  userRoles: UserRole[]

  @OneToMany(() => RolePermission, (rolePermission) => rolePermission.role)
  rolePermissions: RolePermission[]
}
