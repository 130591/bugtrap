import { Column, Entity } from 'typeorm';
import { DefaultEntity } from '@src/shared/lib/persistence/entity/default.entity';

@Entity({ name: 'projects', schema: 'bugtrap' })
export class ProjectEntity extends DefaultEntity<ProjectEntity> {
  @Column({ type: 'uuid', primary: true, default: () => "uuid_generate_v4()" })
  id: string;

  @Column({ type: 'varchar', nullable: false })
  project_name: string;

  @Column({ type: 'varchar', nullable: false })
  description: string;

  @Column({ type: 'timestamp', nullable: false, name:'start_date' })
  startDate: Date;

  @Column({ type: 'timestamp', nullable: false , name: 'end_date' })
  endDate: Date;

  @Column({ type: 'uuid', nullable: false })
  account_id: string;

  @Column({ type: 'uuid', nullable: false })
  owner_id: string
}
