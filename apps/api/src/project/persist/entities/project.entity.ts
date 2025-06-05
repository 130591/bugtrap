import { Column, Entity, OneToMany } from 'typeorm'
import { ProjectStatus } from '@src/project/core/constants'
import { DefaultEntity } from '@src/shared/lib/persistence/typeorm/entity/default.entity'
import { MemberEntity } from './member.entity'
import { InvitationEntity } from './invite.entity'
import { FavoriteEntity } from './favorites.entity'

export enum ProjectPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}


@Entity({ name: 'projects', schema: 'bugtrap' })
export class ProjectEntity extends DefaultEntity<ProjectEntity> {
  @Column({ type: 'uuid', primary: true, default: () => "uuid_generate_v4()" })
  id: string;

  @Column({ type: 'varchar', nullable: false })
  project_name: string;

  @Column({ type: 'varchar', nullable: false })
  description: string;

  @Column({ type: 'timestamp', nullable: false, name: 'start_date' })
  startDate: Date;

  @Column({ type: 'timestamp', nullable: false, name: 'end_date' })
  endDate: Date;

  @Column({ type: 'uuid', nullable: false })
  organization_id: string;

  @Column({ type: 'uuid', nullable: false })
  owner_id: string;

  @OneToMany(() => FavoriteEntity, (favorite) => favorite.project)
  favorites: FavoriteEntity[];

  @Column({
    type: 'enum',
    enum: ProjectStatus,
    default: ProjectStatus.PENDING,
  })
  status: ProjectStatus;

  @Column({
    type: 'enum',
    enum: ProjectPriority,
    default: ProjectPriority.MEDIUM,
  })
  priority: ProjectPriority;

  @Column({ type: 'text', array: true, default: () => 'ARRAY[]::text[]' })
  tags: string[];

  @OneToMany(() => MemberEntity, (member) => member.project)
  members: MemberEntity[];

  @OneToMany(() => InvitationEntity, (invitation) => invitation.project)
  invitations: InvitationEntity[];
}
