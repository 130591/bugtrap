import { Column, Entity, ManyToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm'
import { DefaultEntity } from '@src/shared/lib/persistence/typeorm/entity/default.entity'


@Entity({ name: 'worfkow_rule', schema: 'bugtrap' })
export class WorkflowEntity extends DefaultEntity<WorkflowEntity> {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false })
  project_id: string;

  @Column({ type: 'varchar', nullable: false })
  name: string;

  @Column({ type: 'varchar', nullable: false })
  trigger_event: string;

  @Column({ type: 'jsonb', nullable: true })
  conditions: Record<string, any>;

  @Column({ type: 'jsonb', nullable: false })
  actions: Record<string, any>[];

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
