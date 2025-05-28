import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common'
import { BrokerService } from '@src/shared/module/broker/broker.service'
import { ExternalAuth0Client } from '@src/identity/integration/integration-auth0.client'
import { UserRepository } from '@src/identity/persist/repository'

export interface resetPasswordCommand {
  email: string;
  userId: string;
  termsAccepted: boolean;
}

@Injectable()
export class ResetPasswordService {
  constructor(
    private readonly broker: BrokerService,
    private readonly client: ExternalAuth0Client,
    private readonly userRepo: UserRepository,
  ) {}

	private async validate(command: resetPasswordCommand) {
    const { email, userId, termsAccepted } = command
    const user = await this.userRepo.find({ where: { id: userId } })

    if (!user) {
      throw new UnauthorizedException('User not found')
    }

    if (!termsAccepted) {
      throw new ConflictException('You must accept the terms and conditions')
    }

    if (user.email !== email) {
      throw new UnauthorizedException('Email provided does not match user')
    }
  }

  private async resetPassword(email: string) {
    try {
      await this.client.requestPasswordReset(email)
    } catch (error) {
      if (error.response && error.response.data) {
        throw new ConflictException(`Error sending email: ${error.response.data.message}`)
      }
      throw new ConflictException('Unknown error when trying to reset password')
    }
  }

  async execute(command: resetPasswordCommand) {
    const { email, userId } = command
    
		await this.validate(command)
    await this.resetPassword(email)
    await this.broker.emit('user', 'user.password.reseted', { userId, email })

    return { message: 'Recovery email sent successfully.' }
  }
}
