import { Module } from '@nestjs/common'
import { TypeOrmPersistenceModule } from '@src/shared/lib/persistence/typeorm/typeorm-persistence.module'
import { ProjectRepository } from './repository/project.repositoty'
import { ProjectQueryService } from './queries'
import { InvitationRepository } from './repository/invitation.repository'
import { ConfigModule } from '@src/shared/config/config.module'
import { ConfigService } from '@src/shared/config/service/config.service'
import { dataSourceOptionsFactory } from './typeorm-datasource.factory'
import { FavoriteRepository } from './repository'

@Module({
  imports: [
    TypeOrmPersistenceModule.forRoot({
      name: 'project',
      imports: [ConfigModule.forRoot()],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return dataSourceOptionsFactory(configService)
      },
    }),
  ],
  providers: [ 
    ProjectRepository,
    InvitationRepository,
    ProjectQueryService,
    FavoriteRepository
  ],
  exports: [
    ProjectRepository,
    InvitationRepository,
    ProjectQueryService,
    FavoriteRepository
  ],
})
export class ProjectPersistModule {}