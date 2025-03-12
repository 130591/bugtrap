// import { Column, Entity, ManyToOne } from 'typeorm';
// import { DefaultEntity } from '@src/shared/lib/persistence/entity/default.entity';
// import { ProjectEntity } from './project.entity';

// @Entity({ name: 'Action' })
// export class ActionEntity extends DefaultEntity<ActionEntity> {
//   @Column({ type: 'varchar', nullable: false })
//   assignedTo: string[];

//   @Column({ type: 'json', nullable: false })
//   recurrence: {
//     interval: { name: string; type: string };
//     time: {
//       hour: number;
//       minute: number;
//       date: { day: number; month: number }[];
//     };
//   };

//   @ManyToOne(() => ProjectEntity, (event) => event.actions)
//   event: ProjectEntity;
// }
