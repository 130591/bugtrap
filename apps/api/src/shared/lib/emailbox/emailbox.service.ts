import { Injectable, Logger } from '@nestjs/common'
import { SESClient, SendEmailCommand, ListIdentitiesCommand } from '@aws-sdk/client-ses'

@Injectable()
export class EmailBox {
  private sesClient: SESClient

  constructor() {
    this.sesClient = new SESClient({
      endpoint: process.env.AWS_SES_ENDPOINT || 'http://localhost:4566',
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    })
  }

  /**
   * Verifica se o e-mail está validado no SES antes de enviar.
   */
  private async isEmailVerified(email: string): Promise<boolean> {
    try {
      const command = new ListIdentitiesCommand({ IdentityType: 'EmailAddress' })
      const response = await this.sesClient.send(command)
      return response.Identities?.includes(email) || false
    } catch (error) {
      Logger.error('Erro ao verificar email:', error)
      return false
    }
  }

  /**
   * Envia um e-mail apenas se o remetente estiver verificado no SES.
   */
  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    const sender = process.env.SMTP_USER!
    const isVerified = await this.isEmailVerified(sender)

    if (!isVerified) {
      throw new Error(`Erro: O e-mail ${sender} is not verified in SES.`)
    }

    try {
      const command = new SendEmailCommand({
        Source: sender,
        Destination: { ToAddresses: [to] },
        Message: {
          Subject: { Data: subject },
          Body: { Text: { Data: body } },
        },
      })

      await this.sesClient.send(command)
      Logger.log(`E-mail enviado para ${to}`)
    } catch (error) {
      Logger.error('Error sending email:', error)
      throw new Error(`Error sending email: ${error.message}`)
    }
  }
}
