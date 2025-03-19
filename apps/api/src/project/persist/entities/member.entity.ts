import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm'
import { DefaultEntity } from '@src/shared/lib/persistence/entity/default.entity'
import { ProjectEntity } from './project.entity'

@Entity({ name: 'project_members', schema: 'bugtrap' })
export class MemberEntity extends DefaultEntity<MemberEntity> {
  @Column({ type: 'uuid', primary: true, default: () => "uuid_generate_v4()" })
  id: string;

  @ManyToOne(() => ProjectEntity, (project) => project.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: ProjectEntity;

  @Column({ type: 'uuid', nullable: false })
  project_id: string;

  @Column({ type: 'uuid', nullable: false })
  user_id: string;

  @Column({ type: 'varchar', nullable: false })
  role: 'admin' | 'member' | 'viewer';

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
