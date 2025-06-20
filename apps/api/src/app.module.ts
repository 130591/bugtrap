import { Pool } from 'pg'
import { Module } from '@nestjs/common'
import { APP_INTERCEPTOR } from '@nestjs/core'
import { PostgresDialect } from 'kysely'
import { DiscoveryModule } from '@golevelup/nestjs-discovery'
import { PassportModule } from '@nestjs/passport'
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule } from './shared/config/config.module'
import { ProjectModule } from './project/project.module'
import { CommonResponseInterceptor } from './shared/lib/apicommon'
import { EmailBoxModule } from './shared/lib/emailbox'
import { IdentityModule } from './identity/identity.module'
import { AuthModule } from './shared/module/auth/auth.module'
import { LoggerModule } from './shared/lib/logger/logger.module'
import { ConfigService } from './shared/config/service/config.service'
import { KyselyModule } from './shared/lib/persistence/kisely/kysely.module'


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    KyselyModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return {
          dialect: new PostgresDialect({
            pool: new Pool({
              host:  configService.get('database').host,
              port: configService.get('database').port,
              user: configService.get('database').username,
              password: configService.get('database').password,
              database: configService.get('database').database,
            }),
          }),
        }
      },
      inject: [ConfigService],
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_REFRESH_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
    LoggerModule,
    DiscoveryModule,
    AuthModule,
    EmailBoxModule.forRoot({ apiKey: process.env.EMAIL_SERVICE }),
    ProjectModule,
    IdentityModule,
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: CommonResponseInterceptor }
  ],
})
export class AppModule {}
