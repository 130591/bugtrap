import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Unique,
  JoinColumn,
  Column,
  OneToMany,
} from 'typeorm'
import { Role } from './role.entity'
import { DefaultEntity } from '@src/shared/lib/persistence/typeorm/entity/default.entity'

@Entity({ name: 'permissions' })
export class Permission extends DefaultEntity<Permission> {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ unique: true, length: 100 })
  name: string

  @Column({ type: 'text', nullable: true })
  description?: string

  @OneToMany(() => RolePermission, (rp) => rp.permission)
  rolePermissions: RolePermission[]
}

@Entity({ name: 'role_permissions' })
@Unique(['role', 'permission'])
export class RolePermission {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  roleId: string

  @ManyToOne(() => Role, (role) => role.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  role: Role

  @Column()
  permissionId: string

  @ManyToOne(() => Permission, (permission) => permission.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'permission_id' })
  permission: Permission
}
