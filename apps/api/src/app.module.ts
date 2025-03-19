import { Module } from '@nestjs/common'
import { APP_INTERCEPTOR } from '@nestjs/core'
import { DiscoveryModule } from '@golevelup/nestjs-discovery'
import { ConfigModule } from './shared/config/config.module'
import { ProjectModule } from './project/project.module'
import { CommonResponseInterceptor } from './shared/lib/apicommon'
import { EmailBoxModule } from './shared/lib/emailbox'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DiscoveryModule,
    EmailBoxModule.forRoot({ apiKey: process.env.EMAIL_SERVICE }),
    ProjectModule,
  ],
  providers: [{ provide: APP_INTERCEPTOR, useClass: CommonResponseInterceptor }],
})
export class AppModule {}
