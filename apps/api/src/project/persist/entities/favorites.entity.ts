import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  Unique,
  Column,
  JoinColumn,
  VersionColumn,
} from 'typeorm'
import { DefaultEntity } from '@src/shared/lib/persistence/typeorm/entity/default.entity'
import { ProjectEntity } from './project.entity'

@Entity("project_favorites")
@Unique(["userId", "projectId"])
export class FavoriteEntity extends DefaultEntity<FavoriteEntity> {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  userId: string;

  @Column({ type: "uuid" })
  projectId: string;

  @ManyToOne(() => ProjectEntity, (project) => project.favorites, { onDelete: "CASCADE" })
  @JoinColumn({ name: "projectId" })
  project: ProjectEntity;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  context?: string;

  @VersionColumn()
  version: number;

  @Column({ nullable: true, type: "text" })
  note?: string;

  @Column({ type: "uuid", nullable: true })
  organizationId?: string;

  @Column({ type: "uuid", nullable: true })
  projectOrganizationtId?: string;
}
