import { ConflictException, Injectable } from '@nestjs/common'
import { BrokerService } from '@src/shared/module/broker/broker.service'
import { Organization, OrganizationStatus } from '@src/identity/persist/entities/organization.entity'
import { OrganizationRepository } from '@src/identity/persist/repository'
import { RegisterOrganizationCommand } from './commands'

export interface RegisterAccountCommand {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  username: string;
	termsAccepted: boolean;
}

@Injectable()
export class OrganizationRegisterService {
  constructor(
    private readonly broker: BrokerService,
    private readonly repository: OrganizationRepository,
  ) {}

  async execute(command: RegisterOrganizationCommand): Promise<Organization> {
    const existingOrganization = await this.repository.find({ where: { email: command.email } })

    if (existingOrganization) {
      throw new ConflictException('An organization with the provided email already exists.')
    }

    const savedOrganization = await this.repository.save(new Organization({
      email: command.email,
      organizationName: command.organizationName,
      status: OrganizationStatus.PENDING,
      portraitImage: command.portraitPhoto,
    }))

    await this.broker.emit('exchange.identity', 'organization.registered', savedOrganization)

    return savedOrganization
  }
}