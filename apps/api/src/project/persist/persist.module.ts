import { DynamicModule } from '@nestjs/common'
import { TypeOrmPersistenceModule } from '@src/shared/lib/persistence/typeorm-persistence.module'
import { ProjectRepository } from './repository/project.repositoty'
import { ENTITIES } from './entities'
import { ProjectQueryService } from './queries'
import { InvitationRepository } from './repository/invitation.repository'

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
        InvitationRepository,
        ProjectQueryService
      ],
      exports: [
        ProjectRepository,
        InvitationRepository,
        ProjectQueryService
      ],
    }
  }
}