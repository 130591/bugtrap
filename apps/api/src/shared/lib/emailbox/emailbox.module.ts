import { DynamicModule, Module, Global } from '@nestjs/common'
import * as sendgrid from '@sendgrid/mail'

import { ConfigModule } from '@src/shared/config/config.module'
import { ConfigService } from '@src/shared/config/service/config.service'
import { EmailBox } from './emailbox.service'

@Global()
@Module({
  providers: [
    EmailBox,
    {
      provide: 'SENDGRID_INSTANCE',
      useFactory: async (configService: ConfigService) => {
        const sendgridApiKey = configService.get('email_service')
        sendgrid.setApiKey(sendgridApiKey)
        return sendgrid;
      },
      inject: [ConfigService],
    },
  ],
  exports: [EmailBox],
})
export class EmailBoxModule {
  static forRoot(options: { apiKey: string }): DynamicModule {
    return {
      module: EmailBoxModule,
      imports: [ConfigModule],
      providers: [
        {
          provide: 'SENDGRID_INSTANCE',
          useFactory: async () => {
            sendgrid.setApiKey(options.apiKey)
            return sendgrid;
          },
        },
      ],
      exports: ['SENDGRID_INSTANCE', EmailBox],
    }
  }
}
