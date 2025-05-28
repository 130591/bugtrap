import { Column, Entity, OneToMany } from 'typeorm'
import { DefaultEntity } from '@src/shared/lib/persistence/entity/default.entity'
import { UserRole } from './user-roles.entity'
import { USER_STATUS } from '@src/shared/lib/persistence/types'
import { OrganizationMember } from './organization-member'


@Entity({ name: 'users', schema: 'bugtrap' })
export class User extends DefaultEntity<User> {
  @Column({ type: 'uuid', primary: true, default: () => 'uuid_generate_v4()' })
  id: string;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'first_name' })
  firstName: string;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'last_name' })
  lastName: string;

  @Column({ type: 'varchar', length: 100, nullable: false, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'password_hash' })
  passwordHash: string;

  @Column({ type: 'uuid', nullable: true, name: 'project_id' })
  projectId: string;

  @Column({ type: 'boolean', nullable: false, default: false, name: 'is_verified' })
  isVerified: boolean;

  // @Column({ type: 'varchar', nullable: true, name: 'activation_token' }) 
  // activationToken: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'active', 'suspended', 'deactivated'],
    default: 'pending',
    nullable: false,
    name: 'status',
    enumName: 'user_status'
  })
  userStatus: USER_STATUS;

  @Column({ type: 'varchar', length: 255, nullable: true, unique: true, name: 'github_id' })
  githubId: string;

  @Column({ type: 'varchar', length: 255, nullable: true, unique: true, name: 'github_username' })
  githubUsername: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'display_name' })
  displayName: string;

  @Column({ type: 'text', nullable: true, name: 'portrait_image_url' })
  portraitImageUrl: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ type: 'timestamptz', nullable: true, name: 'last_login_at' })
  lastLoginAt: Date

  @OneToMany(() => UserRole, (userRole) => userRole.user)
  userRoles: UserRole[]

  @OneToMany(() => OrganizationMember, (organizationMember) => organizationMember.user)
  organizationMembers: OrganizationMember[]
}
