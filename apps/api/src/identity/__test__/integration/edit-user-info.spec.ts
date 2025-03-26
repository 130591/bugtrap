import { randomUUID } from 'node:crypto'
import { Test, TestingModule } from '@nestjs/testing'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DataSource } from 'typeorm'
import { NotFoundException } from '@nestjs/common'
import { UserRepository } from '@src/identity/persist/repository'
import { BrokerService } from '@src/shared/module/broker/broker.service'
import { Tables } from '@testInfra/tables-enum'
import { testDbClient } from '@testInfra/knex.database'
import { User } from '@src/identity/persist/entities/user.entity'
import { EditUserInfo } from '@src/identity/core/services'

describe('EditUserInfo (Integration)', () => {
  let service: EditUserInfo
  let repository: UserRepository
  let broker: BrokerService
  let dataSource: DataSource
	let entity: User 

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [User],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([User]),
      ],
      providers: [
        EditUserInfo,
        UserRepository,
        {
          provide: BrokerService,
          useValue: { emit: jest.fn() },
        },
      ],
    }).compile()

    service = module.get<EditUserInfo>(EditUserInfo)
    repository = module.get<UserRepository>(UserRepository)
    broker = module.get<BrokerService>(BrokerService)
    dataSource = module.get<DataSource>(DataSource)

		entity = new User({
			id: randomUUID(),
			firstName: 'John Doe',
			email: 'john@example.com',
			auth0Id: 'auth0id-example',
			lastName: 'Doe',
			passwordHash: 'somehashedpassword'
		})
  })

  afterAll(async () => {
    await dataSource.destroy()
  })

  beforeEach(async () => {
		testDbClient(Tables.Users).del()
		repository.manager.clear(User)
  })

  it('Should update user information', async () => {
    const user = await repository.save(entity)

    await service.execute({ userId: entity.id, updates: { firstName: 'Jane Doe', lastName: entity.lastName } })

    const updatedUser = await repository.find({ where: { id: '123' } })

    expect(updatedUser).toMatchObject({ name: 'Jane Doe' })
    expect(broker.emit).toHaveBeenCalledWith('user', 'user.updated', expect.any(Object))
  })

  it('Should throw error if user not found', async () => {
    await expect(service.execute({ userId: '999', updates: { firstName: 'New Name', lastName: entity.lastName } }))
      .rejects.toThrow(NotFoundException)
  })
})
