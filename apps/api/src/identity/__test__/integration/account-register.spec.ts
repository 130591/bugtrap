import { ConflictException, UnauthorizedException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { AccountRegisterService } from '@src/identity/core/services'
import { AccountRepository } from '@src/identity/persist/repository/organization.repository'
import { BrokerService } from '@src/shared/module/broker/broker.service'
import { ExternalAuth0Client } from '@src/identity/integration/integration-auth0.client'
import { AccountStatus } from '@src/identity/persist/entities/organization.entity'

import * as nock from 'nock'

describe('AccountRegisterService (Integration)', () => {
  let service: AccountRegisterService
  let repository: AccountRepository
  let broker: BrokerService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountRegisterService,
        AccountRepository,
        {
          provide: BrokerService,
          useValue: { emit: jest.fn() },
        },
        ExternalAuth0Client,
      ],
    }).compile()

    service = module.get<AccountRegisterService>(AccountRegisterService)
    repository = module.get<AccountRepository>(AccountRepository)
    broker = module.get<BrokerService>(BrokerService)

    await repository.manager.clear('account')
  })

  afterEach(() => {
    nock.cleanAll()
  })

  it('Should register a new account successfully', async () => {
    nock('https://auth0.com')
      .get('/userinfo')
      .query(true)
      .reply(200, {
        email: 'test@example.com',
        username: 'testuser',
        given_name: 'Test',
        family_name: 'User',
        user_id: 'auth0|12345',
      })

    const command = {
      email: 'test@example.com',
      firstName: 'Everton',
      lastName: 'Paixao',
      password: '221ssss',
      username: 'fullapplabs',
      userId: 'auth0|12345',
      termsAccepted: true,
    }

    const result = await service.execute(command)

    expect(result).toMatchObject({
      email: 'test@example.com',
      name: 'testuser',
      firstName: 'Test',
      lastName: 'User',
      userId: 'auth0|12345',
      status: AccountStatus.PENDING,
    })

    expect(broker.emit).toHaveBeenCalledWith('identity', 'account.registered', expect.any(Object))
  })

  it('should fail when trying to register an already existing email', async () => {
    await repository.persist({
      email: 'duplicate@example.com',
      firstName: 'Everton',
      lastName: 'Paixao',
      name: 'fullapplabs',
      termsAccepted: false,
      status: AccountStatus.ACTIVE,
      password: '221ssss',
      username: 'fullapplabs'
    })

    nock('https://auth0.com')
      .get('/userinfo')
      .query(true)
      .reply(200, {
        email: 'duplicate@example.com',
        username: 'existinguser',
        given_name: 'Existing',
        family_name: 'User',
        user_id: 'auth0|12345',
      })

    const command = {
      email: 'duplicate@example.com',
      firstName: 'Everton',
      lastName: 'Paixao',
      password: '221ssss',
      username: 'fullapplabs',
      userId: 'auth0|12345',
      termsAccepted: true,
    }


    await expect(service.execute(command)).rejects.toThrow(ConflictException)
  })

  it('Should fail if user is not found in Auth0', async () => {
    nock('https://auth0.com')
      .get('/userinfo')
      .query(true)
      .reply(404, {})
    
    const command = {
      email: 'notfound@example.com',
      firstName: 'Everton',
      lastName: 'Paixao',
      password: '221ssss',
      username: 'fullapplabs',
      userId: 'auth0|99999',
      termsAccepted: true,
    }

    await expect(service.execute(command)).rejects.toThrow(UnauthorizedException)
  })
})