import { Injectable, Inject } from '@nestjs/common'
import * as sendgrid from '@sendgrid/mail'

@Injectable()
export class EmailBox {
  constructor(
    @Inject('SENDGRID_INSTANCE') private readonly sendgridClient: typeof sendgrid,
  ) {}

  async sendEmail(to: string, subject: string, body: string): Promise<any> {
    try {
      const msg = {
        to,
        from: 'your-email@example.com',
        subject,
        text: body,
      };

      // Envia o e-mail
      const response = await this.sendgridClient.send(msg)
      return response;
    } catch (error) {
      throw new Error(`Error sending email: ${error.message}`)
    }
  }
}
