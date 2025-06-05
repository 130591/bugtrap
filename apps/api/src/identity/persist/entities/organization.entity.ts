import { Column, Entity, OneToMany } from 'typeorm';
import { DefaultEntity } from '@src/shared/lib/persistence/typeorm/entity/default.entity';
import { UserRole } from './user-roles.entity';


export enum OrganizationStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  BLOCKED = 'blocked',
}

@Entity({ name: 'organizations', schema: 'bugtrap' })
export class Organization extends DefaultEntity<Organization> { 
  @Column({ type: 'uuid', primary: true, default: () => 'uuid_generate_v4()' })
  id: string;

  @Column({ type: 'varchar', nullable: false, name: 'organization_name' })
  organizationName: string; 

  @Column({ type: 'varchar', nullable: false, unique: true })
  email: string;

  @Column({ type: 'enum', name: 'organization_status', enum: OrganizationStatus, default: OrganizationStatus.PENDING })
  status: OrganizationStatus;

  // @Column({ type: 'varchar', name: 'activation_token', length: 255, nullable: true })
  // activationToken: string;

  @Column({ type: 'text', nullable: true, name: 'portrait_image_url' })
  portraitImage: string;

  @Column({ type: 'numeric', precision: 9, scale: 2, nullable: true, name: 'hourly_rate' })
  hourlyRate: number;

  @OneToMany(() => UserRole, (userRole) => userRole.organization)
  members: UserRole[]; 

  // Relationship for Organization Membership (via UserRole)
  @OneToMany(() => UserRole, (userRole) => userRole.organization)
  userRoles: UserRole[]; // These are now memberships/roles within this organization

  // // NEW: Relationship to Projects
  // @OneToMany(() => Project, (project) => project.organization)
  // projects: Project[]; // An organization has many projects
}
