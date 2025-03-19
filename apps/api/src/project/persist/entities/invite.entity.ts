import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { DefaultEntity } from '@src/shared/lib/persistence/entity/default.entity';
import { ProjectEntity } from './project.entity';


@Entity({ name: 'invitations', schema: 'bugtrap' })
export class InvitationEntity extends DefaultEntity<InvitationEntity> {
  @Column({ type: 'uuid', primary: true, default: () => 'gen_random_uuid()' })
  id: string;

  @Column({ type: 'varchar', nullable: false })
  email: string;

  @Column({ type: 'uuid', nullable: true })
  account_id: string | null;

  @ManyToOne(() => ProjectEntity, (project) => project.invitations, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'project_id' })
  project: ProjectEntity;

  @Column({ type: 'uuid', nullable: true })
  project_id: string | null;

  @Column({ type: 'varchar', nullable: false })
  role: 'admin' | 'member' | 'viewer';

  @Column({ type: 'text', unique: true, nullable: false })
  token: string;

  @Column({ type: 'timestamp', nullable: true, default: () => "(now() + interval '7 days')" })
  expires_at: Date | null;

  @Column({ type: 'varchar', nullable: true, default: 'pending' })
  status: 'pending' | 'accepted' | 'expired';

  @Column({ type: 'uuid', nullable: false })
  invited_user_id: string;

  @Column({ type: 'boolean', nullable: false, default: false })
  accepted: boolean;
}
