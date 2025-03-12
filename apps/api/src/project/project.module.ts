import { Module } from '@nestjs/common'
import { HiveModule } from '@src/shared/lib/hive'
import { ConfigService } from '@src/shared/config/service/config.service'
import { QueueModule } from '@src/shared/module/queue/queue.module'
import { ConfigModule } from '@src/shared/config/config.module'
import { PersistModule } from './persist/persist.module'
import { ProjectController } from './http/rest/controller/project'
import { CreateService } from './core/service/create'
import { ListService } from './core/service/list'
import { NotificationOwner } from './core/workers/created-project/created-project.job'
import { ExternalIdentityClient } from './http/client/external-client-identity'
import { CreateProjectListener } from './core/workers'
import { EmailBox } from '@src/shared/lib/emailbox'


@Module({
  imports: [
    PersistModule.forRoot(),
    QueueModule,
    HiveModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const redisHost = configService.get('redis').host
        const redisPort = configService.get('redis').port
        return { host: redisHost, port: redisPort }
      },
      inject: [ConfigService]
    }),
  ],
  providers: [
    ProjectController,
    CreateService,
    ListService,
    EmailBox,
    CreateProjectListener,
    ExternalIdentityClient,
    NotificationOwner,
  ],
  controllers: [ProjectController]
})
export class ProjectModule {}
