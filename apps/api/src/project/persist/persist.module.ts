import { DynamicModule } from '@nestjs/common'
import { TypeOrmPersistenceModule } from '@src/shared/lib/persistence/typeorm-persistence.module'
import { ProjectRepository } from './repository/project.repositoty'
import { ENTITIES } from './entities'
import { QueryService } from './queries/query.service'

export class PersistModule {
  static forRoot(opts?: { migrations?: string[] }): DynamicModule {
    const { migrations } = opts || {}

    return {
      module: PersistModule,
      imports: [
        TypeOrmPersistenceModule.forRoot({
          migrations,
          entities: [...ENTITIES],
        }),
      ],
      providers: [
        ProjectRepository,
        QueryService
      ],
      exports: [
        ProjectRepository,
        QueryService
      ],
    }
  }
}