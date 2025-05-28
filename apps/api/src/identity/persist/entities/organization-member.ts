import { DefaultEntity } from '@src/shared/lib/persistence/entity/default.entity'
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm'
import { MemberRole } from '@src/identity/core/constants/enums'
import { Organization } from './organization.entity'
import { User } from './user.entity'

@Entity({ name: 'organization_members', schema: 'bugtrap' })
export class OrganizationMember extends DefaultEntity<OrganizationMember> {
  @PrimaryColumn({ type: 'uuid', name: 'organization_id' })
  organizationId: string;

  @PrimaryColumn({ type: 'uuid', name: 'user_id' })
  userId: string;

  @Column({
    type: 'enum',
    enum: MemberRole,
    default: MemberRole.MEMBER,
    name: 'role',
  })
  role: MemberRole;

  @Column({ type: 'timestamptz', name: 'joined_at', default: () => 'now()' })
  joinedAt: Date;

  // --- Relationships ---

  @ManyToOne(() => Organization, organization => organization.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organization_id', referencedColumnName: 'id' })
  organization: Organization;

	@ManyToOne(() => User, user => user.organizationMembers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;
}