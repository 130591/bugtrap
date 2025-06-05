import { randomUUID } from 'node:crypto'
import { BadRequestException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as bcrypt from 'bcrypt'
import { BrokerService } from '@src/shared/module/broker/broker.service'
import { User } from '@src/identity/persist/entities/user.entity'
import { UserRepository } from '@src/identity/persist/repository'
import { RegisterUser } from './commands'

@Injectable()
export class UserRegister {

  constructor(
    protected readonly configService: ConfigService,
    private readonly broker: BrokerService,
    private readonly repository: UserRepository,
  ) {
  }

  private async hashOrFallback(password: string): Promise<string> {
    try {
      return await bcrypt.hash(password, 10)
    } catch (error) {
      console.error('Erro ao gerar hash da senha, usando fallback:', error)
      const fallback = randomUUID()
      return await bcrypt.hash(fallback, 10)
    }
  }

	async execute(command: RegisterUser): Promise<{ message: string, userId: string }> {
    const existingUser = await this.repository.find({ where: { email: command.email } })
    if (existingUser) {
      throw new BadRequestException('User with this email already exists.')
    }

    const passwordHash = await this.hashOrFallback(command.password)
    const savedUser = await this.repository.save(new User({
      email: command.email,
      firstName: command.firstName,
      isVerified: true, // Or 'false' if you implement an email verification flow
      passwordHash: passwordHash, 
      organizationId: command.organizationId,
      userStatus: 'active',
    }))

    await this.broker.emit('identity', 'user.created', {
      userId: savedUser.id,
      email: savedUser.email,
    })

    return { message: 'User registered successfully!', userId: savedUser.id }
  }
}
