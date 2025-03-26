import { Module } from '@nestjs/common'
import { APP_INTERCEPTOR } from '@nestjs/core'
import { DiscoveryModule } from '@golevelup/nestjs-discovery'
import { PassportModule } from '@nestjs/passport'
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule } from './shared/config/config.module'
import { ProjectModule } from './project/project.module'
import { CommonResponseInterceptor } from './shared/lib/apicommon'
import { EmailBoxModule } from './shared/lib/emailbox'
import { IdentityModule } from './identity/identity.module'

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.AUTH0_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    DiscoveryModule,
    EmailBoxModule.forRoot({ apiKey: process.env.EMAIL_SERVICE }),
    ProjectModule,
    IdentityModule,
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: CommonResponseInterceptor }
  ],
})
export class AppModule {}
