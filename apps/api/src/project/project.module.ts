import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { EmailBox } from '@src/shared/lib/emailbox'
import { HiveModule } from '@src/shared/lib/hive'
import { ConfigService } from '@src/shared/config/service/config.service'
import { QueueModule } from '@src/shared/module/queue/queue.module'
import { ConfigModule } from '@src/shared/config/config.module'
import { ProjectPersistModule } from './persist/persist.module'
import { ProjectController } from './http/rest/controller/project'
import { ListService } from './core/service/list'
import { CreateService } from './core/service/create'
import { ChangeStatusService } from './core/service/change-status'
import { InviteMemberService } from './core/service/invite-member'
import { ConfirmInvitationService } from './core/service/confirm-invite'
import { NotificationOwner } from './core/workers/project/created-project.job'
import { ExternalIdentityClient } from './http/client/external-client-identity'
import { 
  CreateProjectListener, 
  CreateConfirmedMember, 
  InvitationMember, 
  InvitationMemberListener 
} from './core/workers'

@Module({
  imports: [
    ProjectPersistModule,
    QueueModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('secret_token')
      })
    }),
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
    InviteMemberService,
    InvitationMember,
    CreateConfirmedMember,
    InvitationMemberListener,
    ListService,
    ConfirmInvitationService,
    EmailBox,
    ChangeStatusService,
    CreateProjectListener,
    ExternalIdentityClient,
    NotificationOwner,
  ],
  controllers: [ProjectController]
})
export class ProjectModule {}
